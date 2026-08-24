import { useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/outline";

const bands = Array.from({ length: 9 }, (_, i) => `/watches/watch-band-${i + 1}.jpg`);
const cases = Array.from({ length: 10 }, (_, i) => `/watches/watch-case-${i + 1}.png`);

const IMG = 280;
const HEIGHT = 420;

const WatchShowcase = () => {
  const [bandIdx, setBandIdx] = useState(0);
  const [caseIdx, setCaseIdx] = useState(0);

  const verticalCenter = (HEIGHT - IMG) / 2;

  return (
    <section className="relative overflow-hidden border-t bg-gray-50" style={{ height: HEIGHT }}>
      {/* Band strip — centered both axes; first band centered horizontally */}
      <div
        className="absolute"
        style={{ top: verticalCenter, left: `calc(50% - ${IMG / 2}px)` }}
      >
        <div
          className="flex"
          style={{
            transform: `translateX(${-bandIdx * IMG}px)`,
            transition: "transform 0.7s ease-in-out",
          }}
        >
          {bands.map((src, i) => (
            <img
              key={i}
              src={src}
              width={IMG}
              height={IMG}
              className="object-contain flex-shrink-0"
              alt=""
            />
          ))}
        </div>
      </div>

      {/* Case strip — clipped wrapper prevents adjacent cases from bleeding in */}
      <div
        className="absolute left-1/2 -translate-x-1/2 overflow-hidden"
        style={{ top: verticalCenter, width: IMG, height: IMG }}
      >
        <div
          className="flex flex-col"
          style={{
            transform: `translateY(${-caseIdx * IMG}px)`,
            transition: "transform 0.7s ease-in-out",
          }}
        >
          {cases.map((src, i) => (
            <img
              key={i}
              src={src}
              width={IMG}
              height={IMG}
              className="object-contain flex-shrink-0"
              alt=""
            />
          ))}
        </div>
      </div>

      {/* Left — previous band */}
      <button
        onClick={() => setBandIdx((i) => i - 1)}
        className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-opacity duration-300 ${bandIdx === 0 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      {/* Right — next band */}
      <button
        onClick={() => setBandIdx((i) => i + 1)}
        className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-opacity duration-300 ${bandIdx === bands.length - 1 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>

      {/* Up — previous case */}
      <button
        onClick={() => setCaseIdx((i) => i - 1)}
        className={`absolute top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-opacity duration-300 ${caseIdx === 0 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <ChevronUpIcon className="w-5 h-5" />
      </button>

      {/* Down — next case */}
      <button
        onClick={() => setCaseIdx((i) => i + 1)}
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 transition-opacity duration-300 ${caseIdx === cases.length - 1 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <ChevronDownIcon className="w-5 h-5" />
      </button>
    </section>
  );
};

export default WatchShowcase;
