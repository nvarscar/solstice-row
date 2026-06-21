import { Camera, ArrowRight } from "lucide-react";

interface PhotosBannerProps {
  eventName: string;
}

export default function PhotosBanner({ eventName }: PhotosBannerProps) {
  return (
    <section id="photos" className="py-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <a
          href="/photos"
          className="group block card-glass rounded-3xl p-8 sm:p-12 text-center hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-solstice-gold/30 hover:shadow-xl hover:shadow-solstice-gold/10"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-solstice-gold/20 border border-solstice-gold/40 flex items-center justify-center group-hover:bg-solstice-gold/30 transition-colors">
              <Camera className="w-8 h-8 text-solstice-gold" />
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Event Photos
          </h2>
          <p className="text-forest-300 text-lg mb-8 max-w-2xl mx-auto">
            Relive {eventName} — team galleries, before & after transformations,
            and moments from the water.
          </p>

          <div className="inline-flex items-center gap-2 px-6 py-3 bg-solstice-gold text-forest-950 font-bold rounded-xl group-hover:bg-solstice-gold-light transition-colors">
            View Photos
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </a>
      </div>
    </section>
  );
}
