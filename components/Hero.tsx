import { Calendar, MapPin, Clock, ChevronDown } from "lucide-react";

interface HeroProps {
  name: string;
  tagline: string;
  heroSubtitle: string;
  date: string;
  location: string;
  startTime: string;
  edition: string;
  registrationUrl: string;
  registrationOpen: boolean;
  registrationDeadline: string;
}

export default function Hero({
  name,
  tagline,
  heroSubtitle,
  date,
  location,
  startTime,
  edition,
  registrationUrl,
  registrationOpen,
  registrationDeadline,
}: HeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(245,158,11,0.12) 0%, transparent 60%), linear-gradient(to bottom, #0a1628 0%, #0f2240 40%, #1a3f74 70%, #0c4a6e 100%)",
        }}
      />

      <div className="absolute bottom-0 left-0 right-0 h-48 z-0 overflow-hidden">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z"
            fill="rgba(3,105,161,0.25)"
          />
          <path
            d="M0,80 C240,40 480,100 720,70 C960,40 1200,90 1440,65 L1440,120 L0,120 Z"
            fill="rgba(12,74,110,0.4)"
          />
        </svg>
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto pt-24">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm text-blue-200 mb-8 animate-fade-up">
          <span className="w-2 h-2 rounded-full bg-solstice-gold animate-pulse" />
          {edition} Season
        </div>

        <h1 className="text-6xl sm:text-8xl font-bold tracking-tight mb-4 animate-fade-up animation-delay-200">
          <span className="gold-shimmer">{name}</span>
        </h1>

        <p className="text-xl sm:text-2xl text-blue-100 font-light italic mb-4 animate-fade-up animation-delay-200">
          {tagline}
        </p>

        <p className="text-base sm:text-lg text-blue-200/80 max-w-2xl mx-auto mb-10 animate-fade-up animation-delay-400">
          {heroSubtitle}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-10 animate-fade-up animation-delay-400">
          <div className="flex items-center gap-2 text-blue-100">
            <Calendar className="w-5 h-5 text-solstice-gold flex-shrink-0" />
            <span className="text-sm sm:text-base">{date}</span>
          </div>
          <div className="flex items-center gap-2 text-blue-100">
            <MapPin className="w-5 h-5 text-solstice-gold flex-shrink-0" />
            <span className="text-sm sm:text-base">{location}</span>
          </div>
          <div className="flex items-center gap-2 text-blue-100">
            <Clock className="w-5 h-5 text-solstice-gold flex-shrink-0" />
            <span className="text-sm sm:text-base">Starts at {startTime}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up animation-delay-600">
          {registrationOpen ? (
            <>
              <a
                href={registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 bg-solstice-gold text-navy-900 font-bold text-base rounded-xl hover:bg-solstice-dawn hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                Register for {edition}
              </a>
              <span className="text-blue-300 text-sm">
                Deadline: {registrationDeadline}
              </span>
            </>
          ) : (
            <div className="px-8 py-3.5 bg-white/10 text-white/60 font-semibold text-base rounded-xl border border-white/20 cursor-not-allowed">
              Registration Opens Soon
            </div>
          )}
        </div>
      </div>

      <a
        href="#about"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-blue-300 hover:text-white transition-colors animate-bounce"
        aria-label="Scroll down"
      >
        <ChevronDown className="w-6 h-6" />
      </a>
    </section>
  );
}
