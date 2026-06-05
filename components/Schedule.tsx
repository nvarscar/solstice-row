import clsx from "clsx";

interface ScheduleItem {
  time: string;
  title: string;
  description: string;
  category: string;
}

interface ScheduleProps {
  items: ScheduleItem[];
  date?: string;
}

const categoryColors: Record<string, string> = {
  row:       "bg-water-light/20 text-water-light border-water-light/30",
  milestone: "bg-solstice-orange/20 text-solstice-orange border-solstice-orange/30",
  logistics: "bg-forest-400/20 text-forest-300 border-forest-400/30",
  social:    "bg-solstice-amber/20 text-solstice-amber border-solstice-amber/30",
  race:      "bg-solstice-gold/20 text-solstice-gold border-solstice-gold/30",
};

const categoryDots: Record<string, string> = {
  row:       "bg-water-light",
  milestone: "bg-solstice-orange",
  logistics: "bg-forest-400",
  social:    "bg-solstice-amber",
  race:      "bg-solstice-gold",
};

export default function Schedule({ items, date }: ScheduleProps) {
  return (
    <section id="schedule" className="py-24 px-4 sm:px-6 relative">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-solstice-gold text-sm font-semibold uppercase tracking-widest">
            {date ?? "Day Of"}
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3">
            Event Schedule
          </h2>
        </div>

        <div className="relative">
          <div className="absolute left-[88px] sm:left-24 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />

          <div className="space-y-2">
            {items.map((item, i) => (
              <div
                key={i}
                className="relative flex gap-4 sm:gap-6 group"
              >
                <div className="flex-shrink-0 w-20 sm:w-24 text-right pt-6">
                  <span className="text-xs sm:text-sm text-forest-300 font-mono">
                    {item.time}
                  </span>
                </div>

                <div className="relative flex-shrink-0 pt-6">
                  <div
                    className={clsx(
                      "w-3 h-3 rounded-full mt-0.5 ring-2 ring-forest-950 transition-transform group-hover:scale-125",
                      categoryDots[item.category] ?? "bg-white/50"
                    )}
                  />
                </div>

                <div className="flex-1 pb-6">
                  <div className="card-glass rounded-xl p-4 hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="text-white font-semibold">{item.title}</h3>
                      <span
                        className={clsx(
                          "flex-shrink-0 text-xs px-2 py-0.5 rounded-full border capitalize",
                          categoryColors[item.category] ??
                            "bg-white/10 text-white/60 border-white/20"
                        )}
                      >
                        {item.category}
                      </span>
                    </div>
                    <p className="text-forest-200 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 water-divider" />
      </div>
    </section>
  );
}
