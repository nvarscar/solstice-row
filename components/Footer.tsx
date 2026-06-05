import { Waves } from "lucide-react";

interface FooterProps {
  name: string;
  edition: string;
  contactEmail: string;
}

export default function Footer({ name, edition, contactEmail }: FooterProps) {
  return (
    <footer className="border-t border-white/10 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Waves className="w-5 h-5 text-solstice-gold" />
            <span className="font-bold text-white">
              Solstice<span className="text-solstice-gold">Row</span>
            </span>
            <span className="text-white/40 text-sm">{edition}</span>
          </div>

          <nav className="flex flex-wrap justify-center gap-6 text-sm text-forest-300">
            <a href="#about" className="hover:text-white transition-colors">
              About
            </a>
            <a href="#schedule" className="hover:text-white transition-colors">
              Schedule
            </a>
            <a href="#results" className="hover:text-white transition-colors">
              Results
            </a>
            <a href="#sponsors" className="hover:text-white transition-colors">
              Sponsors
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              Contact
            </a>
            <a
              href="/admin/"
              className="hover:text-white transition-colors text-white/30"
            >
              Admin
            </a>
          </nav>

          <a
            href={`mailto:${contactEmail}`}
            className="text-sm text-forest-300 hover:text-white transition-colors"
          >
            {contactEmail}
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-forest-400/70 text-xs">
            &copy; {new Date().getFullYear()} {name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
