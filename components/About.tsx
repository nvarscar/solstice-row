import { Anchor, Wind, Users } from "lucide-react";

interface AboutProps {
  description: string;
  location: string;
  date: string;
}

const features = [
  {
    icon: Anchor,
    title: "Open Water Racing",
    body: "5K courses on open water for singles, doubles, pairs, fours, and eights.",
  },
  {
    icon: Wind,
    title: "All Skill Levels",
    body: "From competitive open class to masters and recreational categories — everyone rows.",
  },
  {
    icon: Users,
    title: "Community Event",
    body: "A dawn-to-dusk celebration with awards, community meals, and on-water festivities.",
  },
];

export default function About({ description, location, date }: AboutProps) {
  return (
    <section id="about" className="py-24 px-4 sm:px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-solstice-gold text-sm font-semibold uppercase tracking-widest">
            About the Event
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-6">
            What is Solstice Row?
          </h2>
          <p className="text-blue-200 text-lg max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="card-glass rounded-2xl p-8 text-center hover:bg-white/10 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-solstice-gold/20 mb-4">
                  <Icon className="w-6 h-6 text-solstice-gold" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {f.title}
                </h3>
                <p className="text-blue-200 text-sm leading-relaxed">{f.body}</p>
              </div>
            );
          })}
        </div>

        <div className="water-divider" />
      </div>
    </section>
  );
}
