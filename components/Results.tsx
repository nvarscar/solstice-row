"use client";

import { useState } from "react";
import { Trophy, Medal, Award } from "lucide-react";
import clsx from "clsx";

interface ResultEntry {
  place: number;
  name: string;
  club: string;
  time: string;
}

interface ResultCategory {
  name: string;
  entries: ResultEntry[];
}

interface YearResults {
  year: string;
  categories: ResultCategory[];
}

interface ResultsProps {
  years: YearResults[];
}

const placeIcons = [Trophy, Medal, Award];
const placeColors = [
  "text-solstice-gold",
  "text-slate-300",
  "text-amber-600",
];

export default function Results({ years }: ResultsProps) {
  const [activeYear, setActiveYear] = useState(years[0]?.year ?? "");
  const [activeCategory, setActiveCategory] = useState(0);

  const year = years.find((y) => y.year === activeYear);

  if (!year) return null;

  return (
    <section id="results" className="py-24 px-4 sm:px-6 relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-solstice-gold text-sm font-semibold uppercase tracking-widest">
            Leaderboard
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3">
            Race Results
          </h2>
        </div>

        {years.length > 1 && (
          <div className="flex justify-center gap-2 mb-8">
            {years.map((y) => (
              <button
                key={y.year}
                onClick={() => {
                  setActiveYear(y.year);
                  setActiveCategory(0);
                }}
                className={clsx(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                  activeYear === y.year
                    ? "bg-solstice-gold text-navy-900"
                    : "bg-white/10 text-blue-200 hover:bg-white/20"
                )}
              >
                {y.year}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {year.categories.map((cat, i) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(i)}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                activeCategory === i
                  ? "bg-water-deep text-white border border-water-light/40"
                  : "card-glass text-blue-200 hover:bg-white/10"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {year.categories[activeCategory] && (
          <div className="card-glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-white font-semibold">
                {year.categories[activeCategory].name}
              </h3>
              <p className="text-blue-300 text-sm">{activeYear} Season</p>
            </div>
            <div className="divide-y divide-white/5">
              {year.categories[activeCategory].entries.map((entry) => {
                const place = entry.place;
                const Icon = place <= 3 ? placeIcons[place - 1] : null;
                return (
                  <div
                    key={entry.place}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 flex-shrink-0 flex items-center justify-center">
                      {Icon ? (
                        <Icon
                          className={clsx(
                            "w-5 h-5",
                            placeColors[place - 1]
                          )}
                        />
                      ) : (
                        <span className="text-blue-400 text-sm font-mono w-5 text-center">
                          {place}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {entry.name}
                      </p>
                      <p className="text-blue-300 text-sm truncate">
                        {entry.club}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="text-solstice-gold font-mono font-semibold">
                        {entry.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-12 water-divider" />
      </div>
    </section>
  );
}
