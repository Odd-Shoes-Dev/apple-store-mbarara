import {
  useEffect,
  useState,
  useCallback,
  useRef,
  TouchEvent,
  MouseEvent as ReactMouseEvent,
  WheelEvent,
} from "react";
import Link from "next/link";
import { HeroSlide } from "../server/domain/types";

type Props = {
  slides: HeroSlide[];
  whatsappNumber?: string | null;
};

const INTERVAL = 5000;

const COMMIT_THRESHOLD = 0.15; // fraction of track width dragged before it counts as a swipe
const WHEEL_THRESHOLD = 30;
const WHEEL_COOLDOWN = 600;

export default function HeroCarousel({ slides, whatsappNumber }: Props) {
  const loop = slides.length > 1;

  // trackIndex is the DOM position within the rendered track. When looping,
  // the track is [clone-of-last, ...slides, clone-of-first], so real slide 0
  // lives at trackIndex 1. Going past either end lands on a clone, which is
  // visually identical to the real slide it mirrors — once that transition
  // finishes we silently snap back to the real one with no transition, so
  // the loop reads as continuous instead of rewinding through every slide.
  const [trackIndex, setTrackIndex] = useState(loop ? 1 : 0);
  const [paused, setPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0); // percent of track width, follows the pointer live
  const [dragging, setDragging] = useState(false);
  const [snapping, setSnapping] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);
  const lastWheelAt = useRef(0);

  const current = loop ? (trackIndex - 1 + slides.length) % slides.length : trackIndex;

  // Clamped to the track's actual bounds — without this, firing next()/prev()
  // again before the previous transition (and any clone snap-correction) has
  // settled — a fast double-swipe, rapid arrow clicks, the auto-advance timer
  // landing mid-transition — could walk trackIndex past the last rendered
  // panel, scrolling into the empty overflow-hidden space beyond it.
  const maxTrackIndex = loop ? slides.length + 1 : slides.length - 1;
  const next = useCallback(
    () => setTrackIndex((i) => Math.min(i + 1, maxTrackIndex)),
    [maxTrackIndex]
  );
  const prev = useCallback(() => setTrackIndex((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    if (!loop || paused) return;
    const id = setInterval(next, INTERVAL);
    return () => clearInterval(id);
  }, [loop, paused, next]);

  // After landing on a clone panel, jump (no transition) to the matching
  // real slide once the pointer/wheel-triggered animation has settled.
  const onTransitionEnd = () => {
    if (!loop) return;
    if (trackIndex === 0) {
      setSnapping(true);
      setTrackIndex(slides.length);
    } else if (trackIndex === slides.length + 1) {
      setSnapping(true);
      setTrackIndex(1);
    }
  };

  useEffect(() => {
    if (!snapping) return;
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => setSnapping(false));
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf1);
  }, [snapping]);

  const goTo = (index: number) => setTrackIndex(loop ? index + 1 : index);

  const startDrag = (clientX: number) => {
    if (!loop) return;
    dragStartX.current = clientX;
    setDragging(true);
    setPaused(true);
  };

  const updateDrag = (clientX: number) => {
    if (dragStartX.current === null || !trackRef.current) return;
    const width = trackRef.current.offsetWidth || 1;
    const deltaPercent = ((clientX - dragStartX.current) / width) * 100;
    setDragOffset(deltaPercent);
  };

  const endDrag = () => {
    if (dragStartX.current === null) {
      setPaused(false);
      return;
    }
    const offsetFraction = dragOffset / 100;
    if (Math.abs(offsetFraction) > COMMIT_THRESHOLD) {
      if (offsetFraction < 0) next();
      else prev();
    }
    dragStartX.current = null;
    setDragOffset(0);
    setDragging(false);
    setPaused(false);
  };

  const onTouchStart = (e: TouchEvent) => startDrag(e.touches[0].clientX);
  const onTouchMove = (e: TouchEvent) => updateDrag(e.touches[0].clientX);
  const onTouchEnd = () => endDrag();

  const onMouseDown = (e: ReactMouseEvent) => {
    e.preventDefault();
    startDrag(e.clientX);
  };
  const onMouseMove = (e: ReactMouseEvent) => {
    if (dragStartX.current !== null) updateDrag(e.clientX);
  };
  const onMouseUp = () => endDrag();
  const onMouseLeaveTrack = () => {
    if (dragStartX.current !== null) endDrag();
    setPaused(false);
  };

  // Two-finger horizontal trackpad scroll — ignore mostly-vertical scrolling.
  const onWheel = (e: WheelEvent) => {
    if (!loop || Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < WHEEL_THRESHOLD) {
      return;
    }
    const now = Date.now();
    if (now - lastWheelAt.current < WHEEL_COOLDOWN) return;
    lastWheelAt.current = now;
    if (e.deltaX > 0) next();
    else prev();
  };

  if (slides.length === 0) return null;

  const activeSlide = slides[current];
  const trackSlides = loop ? [slides[slides.length - 1], ...slides, slides[0]] : slides;

  return (
    <div
      className="relative w-full overflow-hidden touch-pan-y select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={onMouseLeaveTrack}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onWheel={onWheel}
    >
      <div
        ref={trackRef}
        className="flex"
        onTransitionEnd={onTransitionEnd}
        style={{
          transform: `translateX(calc(${-trackIndex * 100}% + ${dragOffset}%))`,
          transition: dragging || snapping ? "none" : "transform 400ms cubic-bezier(0.22, 1, 0.36, 1)",
          cursor: loop ? (dragging ? "grabbing" : "grab") : undefined,
        }}
      >
        {trackSlides.map((slide, i) => {
          const waLink = whatsappNumber
            ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, I'm interested in the ${slide.title}`)}`
            : null;

          return (
            <div
              key={`${slide.id}-${i}`}
              className="relative w-full flex-shrink-0"
              style={{ background: slide.backgroundColor }}
            >
              {/* Subtle radial glow behind image */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 60% 80% at 80% 50%, ${slide.accentColor}22 0%, transparent 70%)`,
                }}
              />

              <div className="relative max-w-5xl mx-auto px-6 lg:px-0 flex flex-col md:flex-row md:items-center min-h-[480px] md:min-h-[520px] py-14 md:py-0">
                {/* Product image — mobile: stacked above text */}
                {slide.imageUrl && (
                  <div className="flex md:hidden items-center justify-center mb-6">
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="max-h-48 max-w-full object-contain pointer-events-none"
                      style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))" }}
                      draggable={false}
                    />
                  </div>
                )}

                {/* Text content */}
                <div className="flex-1 md:py-20 md:pr-8 z-10 text-center md:text-left">
                  {slide.categoryLabel && (
                    <p
                      className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center justify-center md:justify-start gap-2"
                      style={{ color: slide.accentColor }}
                    >
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full"
                        style={{ background: slide.accentColor }}
                      />
                      {slide.categoryLabel}
                    </p>
                  )}

                  <h1
                    className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-none tracking-tight"
                    style={{ letterSpacing: "-0.03em" }}
                  >
                    {slide.title}
                  </h1>

                  {slide.subtitle && (
                    <p className="mt-4 text-base sm:text-lg" style={{ color: "#86868b" }}>
                      {slide.subtitle}
                    </p>
                  )}

                  {slide.priceLabel && (
                    <p className="mt-5 text-2xl font-bold text-white">
                      {slide.priceLabel}
                    </p>
                  )}

                  <div className="mt-8 flex flex-wrap gap-3 justify-center md:justify-start">
                    <Link href={slide.ctaPrimaryHref} passHref>
                      <a
                        className="inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-bold transition-opacity hover:opacity-90"
                        style={{ background: slide.accentColor, color: "#000" }}
                      >
                        {slide.ctaPrimaryLabel}
                      </a>
                    </Link>
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-sm font-bold bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Order via WhatsApp
                      </a>
                    )}
                  </div>
                </div>

                {/* Product image — desktop: absolute, right side */}
                {slide.imageUrl && (
                  <div className="hidden md:flex absolute right-0 top-0 bottom-0 w-[45%] items-center justify-center pointer-events-none">
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="max-h-[480px] max-w-full object-contain drop-shadow-2xl"
                      style={{ filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.5))" }}
                      draggable={false}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Prev / Next arrows */}
      {loop && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white bg-white/10 hover:bg-white/25 transition-colors z-20"
            aria-label="Previous slide"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white bg-white/10 hover:bg-white/25 transition-colors z-20"
            aria-label="Next slide"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* Dot indicators */}
      {loop && (
        <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? 20 : 6,
                height: 6,
                background: i === current ? activeSlide.accentColor : "rgba(255,255,255,0.35)",
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
