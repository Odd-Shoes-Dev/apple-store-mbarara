import { FunctionComponent, TouchEvent, useRef, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { ProductImage } from "../server/domain/types";

type Props = {
  images: ProductImage[];
  alt: string;
  mainClassName?: string;
  imageClassName?: string;
};

const SWIPE_THRESHOLD = 40;

const ImageCarousel: FunctionComponent<Props> = ({ images, alt, mainClassName, imageClassName }) => {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const count = images.length;
  if (count === 0) return null;

  const goTo = (i: number) => setIndex((i + count) % count);
  const prev = () => goTo(index - 1);
  const next = () => goTo(index + 1);

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      if (delta < 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  return (
    <div>
      <div
        className={`relative ${mainClassName ?? ""}`}
        onTouchStart={count > 1 ? onTouchStart : undefined}
        onTouchEnd={count > 1 ? onTouchEnd : undefined}
      >
        {count > 1 && (
          <button
            type="button"
            onClick={prev}
            aria-label="Previous image"
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-600 hover:text-gray-900"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        <LazyLoadImage src={images[index].url} alt={alt} className={imageClassName} />

        {count > 1 && (
          <button
            type="button"
            onClick={next}
            aria-label="Next image"
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-600 hover:text-gray-900"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>

      {count > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to image ${i + 1}`}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === index ? "bg-gray-900" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
