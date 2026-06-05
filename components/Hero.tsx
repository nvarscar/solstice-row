import { Calendar, MapPin, Sunrise, Sunset, ChevronDown } from "lucide-react";

interface HeroProps {
  name: string;
  tagline: string;
  heroSubtitle: string;
  date: string;
  location: string;
  venue: string;
  sunriseTime: string;
  sunsetTime: string;
  edition: string;
  registrationOpen: boolean;
  registrationDeadline: string;
  donationUrl: string;
}

export default function Hero({
  name,
  tagline,
  heroSubtitle,
  date,
  location,
  venue,
  sunriseTime,
  sunsetTime,
  edition,
  registrationOpen,
  registrationDeadline,
  donationUrl,
}: HeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0 hero-bg" />

      <div className="absolute bottom-0 left-0 right-0 h-40 z-0 overflow-hidden">
        <svg
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0,50 C240,90 480,10 720,50 C960,90 1200,10 1440,50 L1440,100 L0,100 Z"
            className="hero-wave-upper"
          />
          <path
            d="M0,70 C360,30 720,80 1080,40 C1200,25 1350,60 1440,55 L1440,100 L0,100 Z"
            className="hero-wave-lower"
          />
        </svg>
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto pt-24">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-solstice-gold/30 text-sm text-solstice-gold mb-8 animate-fade-up">
          <span className="w-2 h-2 rounded-full bg-solstice-gold animate-pulse" />
          {venue} · {edition}
        </div>

        <h1 className="text-6xl sm:text-8xl font-bold tracking-tight mb-4 animate-fade-up animation-delay-200">
          <span className="gold-shimmer">{name}</span>
        </h1>

        <p className="text-xl sm:text-2xl text-solstice-gold font-semibold uppercase tracking-wide mb-4 animate-fade-up animation-delay-200">
          {tagline}
        </p>

        <p className="text-base sm:text-lg text-forest-200/80 max-w-2xl mx-auto mb-10 animate-fade-up animation-delay-400">
          {heroSubtitle}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-10 animate-fade-up animation-delay-400">
          <div className="flex items-center gap-2 text-forest-100">
            <Calendar className="w-5 h-5 text-solstice-gold flex-shrink-0" />
            <span className="text-sm sm:text-base">{date}</span>
          </div>
          <div className="flex items-center gap-2 text-forest-100">
            <MapPin className="w-5 h-5 text-solstice-gold flex-shrink-0" />
            <span className="text-sm sm:text-base">{location}</span>
          </div>
          <div className="flex items-center gap-2 text-forest-100">
            <Sunrise className="w-5 h-5 text-solstice-orange flex-shrink-0" />
            <span className="text-sm sm:text-base">{sunriseTime}</span>
          </div>
          <div className="flex items-center gap-2 text-forest-100">
            <Sunset className="w-5 h-5 text-solstice-orange flex-shrink-0" />
            <span className="text-sm sm:text-base">{sunsetTime}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up animation-delay-600">
          {registrationOpen ? (
            <>
              <a
                href="/register"
                className="px-8 py-3.5 bg-solstice-gold text-forest-950 font-bold text-base rounded-xl hover:bg-solstice-gold-light hover:shadow-lg hover:shadow-solstice-gold/25 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                Register Your Team
              </a>
              <a
                href={donationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 bg-white/10 border border-solstice-gold/40 text-solstice-gold font-semibold text-base rounded-xl hover:bg-white/15 transition-all duration-200"
              >
                Donate / Pledge
              </a>
            </>
          ) : (
            <div className="px-8 py-3.5 bg-white/10 text-white/60 font-semibold text-base rounded-xl border border-white/20 cursor-not-allowed">
              Registration Opens Soon
            </div>
          )}
        </div>

        {registrationOpen && (
          <p className="text-forest-400 text-sm mt-4 animate-fade-up animation-delay-600">
            Registration deadline: {registrationDeadline}
          </p>
        )}
      </div>

      <a
        href="#about"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-forest-300 hover:text-white transition-colors animate-bounce"
        aria-label="Scroll down"
      >
        <ChevronDown className="w-6 h-6" />
      </a>
    </section>
  );
}
