"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface Props {
  teamName: string;
  photoIds: string[];
  intervalMs?: number;
}

export default function TeamSlideshow({ teamName, photoIds, intervalMs = 10000 }: Props) {
  const [index, setIndex] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setProgressKey((k) => k + 1);
    timerRef.current = setTimeout(() => {
      setIndex((i) => (i + 1) % photoIds.length);
      setProgressKey((k) => k + 1);
    }, intervalMs);
  }, [photoIds.length, intervalMs]);

  useEffect(() => {
    if (photoIds.length <= 1) return;
    resetTimer();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [index, resetTimer, photoIds.length]);

  const goTo = useCallback((next: number) => {
    setIndex((next + photoIds.length) % photoIds.length);
    if (timerRef.current) clearTimeout(timerRef.current);
    setProgressKey((k) => k + 1);
  }, [photoIds.length]);

  if (photoIds.length === 0) return null;

  return (
    <div className="card-glass rounded-2xl overflow-hidden">
      <div className="relative aspect-[4/3] bg-black/20">
        <Image
          src={`/api/photos/${photoIds[index]}`}
          alt={`${teamName} — photo ${index + 1}`}
          fill
          className="object-cover select-none"
          unoptimized
        />

        {/* Prev / Next */}
        {photoIds.length > 1 && (
          <>
            <button
              onClick={() => goTo(index - 1)}
              aria-label="Previous"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => goTo(index + 1)}
              aria-label="Next"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-1.5 z-10">
              {photoIds.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to photo ${i + 1}`}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === index ? "bg-white scale-110" : "bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-10">
              <div
                key={progressKey}
                className="h-full bg-solstice-gold origin-left"
                style={{
                  animation: `slideshow-progress ${intervalMs}ms linear forwards`,
                }}
              />
            </div>
          </>
        )}

        {/* Counter badge */}
        <div className="absolute top-3 right-3 z-10 px-2 py-1 bg-black/60 rounded-full text-white text-xs font-medium">
          {index + 1} / {photoIds.length}
        </div>
      </div>

      <div className="px-4 py-3">
        <p className="text-white font-semibold">{teamName}</p>
        <p className="text-forest-400 text-xs">
          {photoIds.length} photo{photoIds.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
