import { Users, Heart, Trophy, Waves } from "lucide-react";

interface AboutProps {
  description: string;
  cause: string;
  format: string;
}

const features = [
  {
    icon: Users,
    title: "Team or Individual",
    body: "Enter solo or as a relay team. Singles, doubles, quads, and eights share one boat and one erg — rotating all day long.",
  },
  {
    icon: Heart,
    title: "Raise Pledges per km",
    body: "Rally your network to pledge $/km. The more you row, the more you raise for new boats, oars, and coaching equipment.",
  },
  {
    icon: Waves,
    title: "Row Elk Lake",
    body: "Follow the scenic whole-lake flow pattern on beautiful Elk Lake. Erg on the tarmac between boat rotations to keep the km ticking.",
  },
  {
    icon: Trophy,
    title: "Prizes & Fun",
    body: "Compete for Best Team Name, Most Kilometers, and Most Money Raised. Hourly raffles, 50/50 draw, live music, and BBQ all day.",
  },
];

export default function About({ description, cause, format }: AboutProps) {
  return (
    <section id="about" className="py-24 px-4 sm:px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-solstice-gold text-sm font-semibold uppercase tracking-widest">
            About the Event
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-6">
            What is the Solstice Row?
          </h2>
          <p className="text-forest-200 text-lg max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-16">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="card-glass rounded-2xl p-6 text-center hover:bg-white/10 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-solstice-gold/20 mb-4">
                  <Icon className="w-6 h-6 text-solstice-gold" />
                </div>
                <h3 className="text-white font-semibold text-base mb-2">
                  {f.title}
                </h3>
                <p className="text-forest-300 text-sm leading-relaxed">{f.body}</p>
              </div>
            );
          })}
        </div>

        <div className="card-glass rounded-2xl p-6 mb-10">
          <h3 className="text-solstice-gold font-semibold text-sm uppercase tracking-widest mb-3">
            Our Cause
          </h3>
          <p className="text-forest-200 leading-relaxed">{cause}</p>
        </div>

        <div className="card-glass rounded-2xl p-6 mb-10">
          <h3 className="text-solstice-gold font-semibold text-sm uppercase tracking-widest mb-3">
            Format & Rules
          </h3>
          <p className="text-forest-200 leading-relaxed">{format}</p>
        </div>

        <div className="water-divider" />
      </div>
    </section>
  );
}
