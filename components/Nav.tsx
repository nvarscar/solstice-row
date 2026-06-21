"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Waves } from "lucide-react";

const links = [
  { label: "About", href: "#about" },
  { label: "Schedule", href: "#schedule" },
  { label: "Results", href: "#results" },
  { label: "Photos", href: "/#photos" },
  { label: "Sponsors", href: "#sponsors" },
  { label: "Contact", href: "#contact" },
];

interface NavProps {
  registrationOpen: boolean;
  photosEnabled?: boolean;
}

export default function Nav({ registrationOpen, photosEnabled = false }: NavProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  // On non-home pages, bare hash links must include "/" to navigate home first.
  const resolveHref = (href: string) =>
    !isHome && href.startsWith("#") ? "/" + href : href;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-forest-950/95 backdrop-blur-md shadow-lg shadow-black/30"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 group">
          <Waves className="w-6 h-6 text-solstice-gold group-hover:text-solstice-dawn transition-colors" />
          <span className="font-bold text-white text-lg tracking-tight">
            Solstice<span className="text-solstice-gold">Row</span>
          </span>
        </a>

        <ul className="hidden md:flex items-center gap-6">
          {links.filter((l) => l.label !== "Photos" || photosEnabled).map((l) => (
            <li key={l.href}>
              <a
                href={resolveHref(l.href)}
                className="text-sm text-forest-200 hover:text-white transition-colors duration-200"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          {registrationOpen ? (
            <a
              href="/register"
              className="px-4 py-2 bg-solstice-gold text-forest-950 text-sm font-semibold rounded-lg hover:bg-solstice-gold-light transition-colors"
            >
              Register Now
            </a>
          ) : (
            <span className="px-4 py-2 bg-white/10 text-white/50 text-sm rounded-lg cursor-not-allowed">
              Registration Closed
            </span>
          )}
        </div>

        <button
          className="md:hidden text-white p-1"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-forest-950/98 backdrop-blur-md border-t border-white/10">
          <ul className="px-4 py-4 space-y-3">
            {links.filter((l) => l.label !== "Photos" || photosEnabled).map((l) => (
              <li key={l.href}>
                <a
                  href={resolveHref(l.href)}
                  onClick={() => setOpen(false)}
                  className="block text-forest-200 hover:text-white py-1 transition-colors"
                >
                  {l.label}
                </a>
              </li>
            ))}
            {registrationOpen && (
              <li>
                <a
                  href="/register"
                  className="block w-full text-center px-4 py-2 bg-solstice-gold text-forest-950 font-semibold rounded-lg mt-2"
                >
                  Register Now
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
