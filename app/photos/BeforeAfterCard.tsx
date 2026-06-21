"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

function formatShiftDuration(minutes: number | null | undefined): string {
  if (minutes == null || minutes <= 0) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}


interface Props {
  teamName: string;
  beforeId: string;
  afterId: string;
  shiftMinutes: number | null;
  startTime?: string | null;   // HH:MM
  endTime?: string | null;     // HH:MM
  tzAbbr?: string | null;      // e.g. "PDT"
}

function ShiftTimeline({
  minutes,
  startTime,
  endTime,
  tzAbbr,
}: {
  minutes: number | null;
  startTime?: string | null;
  endTime?: string | null;
  tzAbbr?: string | null;
}) {
  const hasStart = !!startTime;
  const hasEnd = !!endTime;
  const hasDuration = minutes != null && minutes > 0;

  if (!hasStart && !hasEnd && !hasDuration) return null;

  const durationLabel = hasDuration ? formatShiftDuration(minutes) : null;

  return (
    <div className="px-5 pt-3 pb-4 border-t border-white/[0.07]">
      {/* Track row */}
      <div className="flex items-center gap-2">
        {/* Start dot */}
        <div className="w-1.5 h-1.5 rounded-full bg-white/30 flex-shrink-0" />

        {/* Line with optional duration chip */}
        <div className="relative flex-1 flex items-center">
          <div className="w-full border-t border-white/15" />
          {durationLabel && (
            <span className="absolute left-1/2 -translate-x-1/2 -top-4 text-[10px] text-white/40 tabular-nums whitespace-nowrap">
              {durationLabel}
            </span>
          )}
        </div>

        {/* End dot */}
        <div className="w-1.5 h-1.5 rounded-full bg-white/30 flex-shrink-0" />
      </div>

      {/* Labels row */}
      {(hasStart || hasEnd) && (
        <div className="flex justify-between mt-1.5 text-[11px] tabular-nums">
          <span className="text-white/50">
            {hasStart ? startTime : ""}
            {hasStart && tzAbbr ? <span className="ml-1 text-white/25 text-[10px] not-tabular">{tzAbbr}</span> : null}
          </span>
          <span className="text-white/50">
            {hasEnd && tzAbbr ? <span className="mr-1 text-white/25 text-[10px] not-tabular">{tzAbbr}</span> : null}
            {hasEnd ? endTime : ""}
          </span>
        </div>
      )}
    </div>
  );
}

export default function BeforeAfterCard({ teamName, beforeId, afterId, shiftMinutes, startTime, endTime, tzAbbr }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dividerPct, setDividerPct] = useState(50);
  const dividerRef = useRef(50);
  const rafRef = useRef<number | null>(null);
  const dragging = useRef(false);

  const setDivider = useCallback((pct: number) => {
    dividerRef.current = pct;
    setDividerPct(pct);
  }, []);

  const snapTo = useCallback((target: number) => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    const start = dividerRef.current;
    const duration = 300;
    const t0 = performance.now();
    function tick(now: number) {
      const t = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDivider(start + (target - start) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else rafRef.current = null;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [setDivider]);

  const updateDivider = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setDivider(pct);
  }, [setDivider]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    dragging.current = true;
    updateDivider(e.clientX);
  };
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    updateDivider(e.clientX);
  }, [updateDivider]);
  const onMouseUp = () => { dragging.current = false; };

  const onTouchStart = (e: React.TouchEvent) => {
    dragging.current = true;
    updateDivider(e.touches[0].clientX);
  };
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging.current) return;
    updateDivider(e.touches[0].clientX);
  }, [updateDivider]);
  const onTouchEnd = () => { dragging.current = false; };

  return (
    <div className="card-glass rounded-2xl overflow-hidden">
      {/* Team name header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <span className="text-white font-semibold">{teamName}</span>
        <span className="text-forest-400 text-xs">Drag to compare</span>
      </div>

      {/* Comparison slider */}
      <div
        ref={containerRef}
        className="relative aspect-[16/9] bg-black/20 cursor-col-resize select-none overflow-hidden"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* AFTER — full-size base layer (always visible, never moves) */}
        <Image
          src={`/api/photos/${afterId}`}
          alt={`${teamName} — finish`}
          fill
          className="object-cover pointer-events-none"
          unoptimized
          draggable={false}
        />

        {/* BEFORE — full-size layer on top, faded out to the right of the divider.
            Both images stay at full resolution / position; only the mask moves. */}
        <div
          className="absolute inset-0"
          style={{
            WebkitMaskImage: `linear-gradient(to right, black calc(${dividerPct}% - 20px), transparent calc(${dividerPct}% + 20px))`,
            maskImage: `linear-gradient(to right, black calc(${dividerPct}% - 20px), transparent calc(${dividerPct}% + 20px))`,
          }}
        >
          <Image
            src={`/api/photos/${beforeId}`}
            alt={`${teamName} — start`}
            fill
            className="object-cover pointer-events-none"
            unoptimized
            draggable={false}
          />
        </div>

        {/* Labels — clickable pills */}
        <button
          onClick={() => snapTo(90)}
          className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-forest-950/80 border border-white/20 rounded-full text-xs font-bold text-white tracking-wider uppercase hover:bg-white/20 hover:border-white/50 transition-colors cursor-pointer"
        >
          Start
        </button>
        <button
          onClick={() => snapTo(10)}
          className="absolute top-3 right-3 z-10 px-2.5 py-1 bg-forest-950/80 border border-solstice-gold/40 rounded-full text-xs font-bold text-solstice-gold tracking-wider uppercase hover:bg-solstice-gold/20 hover:border-solstice-gold/70 transition-colors cursor-pointer"
        >
          Finish
        </button>

        {/* Divider handle — thin line + grab knob */}
        <div
          className="absolute top-0 bottom-0 z-20 flex items-center justify-center pointer-events-none"
          style={{
            left: `calc(${dividerPct}% - 1px)`,
          }}
        >
          <div className="w-px h-full bg-white/60" />
          <div className="absolute w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-solstice-gold pointer-events-auto cursor-col-resize">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-forest-900" stroke="currentColor" strokeWidth="2">
              <path d="M8 6l-4 6 4 6M16 6l4 6-4 6" />
            </svg>
          </div>
        </div>
      </div>

      <ShiftTimeline minutes={shiftMinutes} startTime={startTime} endTime={endTime} tzAbbr={tzAbbr} />
    </div>
  );
}
