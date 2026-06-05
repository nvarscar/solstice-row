import { ExternalLink } from "lucide-react";

interface Sponsor {
  name: string;
  url: string;
  logo: string;
}

interface SponsorTier {
  name: string;
  sponsors: Sponsor[];
}

interface SponsorsProps {
  tiers: SponsorTier[];
}

const tierStyles: Record<string, string> = {
  Gold: "text-solstice-gold border-solstice-gold/40 bg-solstice-gold/10",
  Silver: "text-slate-300 border-slate-400/40 bg-slate-400/10",
  Bronze: "text-amber-600 border-amber-700/40 bg-amber-700/10",
};

export default function Sponsors({ tiers }: SponsorsProps) {
  return (
    <section id="sponsors" className="py-24 px-4 sm:px-6 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-solstice-gold text-sm font-semibold uppercase tracking-widest">
            Partners
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">
            Our Sponsors
          </h2>
          <p className="text-forest-200 max-w-xl mx-auto">
            Solstice Row is made possible by the generous support of these
            organizations.
          </p>
        </div>

        <div className="space-y-12">
          {tiers.map((tier) => (
            <div key={tier.name}>
              <div className="flex items-center gap-4 mb-6">
                <span
                  className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                    tierStyles[tier.name] ??
                    "text-forest-300 border-forest-400/30 bg-forest-400/10"
                  }`}
                >
                  {tier.name}
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {tier.sponsors.map((sponsor) => (
                  <a
                    key={sponsor.name}
                    href={sponsor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-glass rounded-xl p-4 flex flex-col items-center justify-center gap-2 min-h-[80px] hover:bg-white/10 transition-colors group"
                  >
                    {sponsor.logo ? (
                      <img
                        src={sponsor.logo}
                        alt={sponsor.name}
                        className="max-h-10 max-w-full object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <span className="text-white/70 group-hover:text-white text-sm font-medium text-center transition-colors">
                        {sponsor.name}
                      </span>
                    )}
                    <ExternalLink className="w-3 h-3 text-white/30 group-hover:text-white/60 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-forest-300 text-sm mb-4">
            Interested in sponsoring Solstice Row?
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-6 py-2.5 border border-solstice-gold/50 text-solstice-gold rounded-lg text-sm font-medium hover:bg-solstice-gold/10 transition-colors"
          >
            Get in Touch
          </a>
        </div>

        <div className="mt-16 water-divider" />
      </div>
    </section>
  );
}
