import { Mail, MapPin, Heart } from "lucide-react";

interface ContactProps {
  contactEmail: string;
  location: string;
  address: string;
  donationUrl: string;
  registrationOpen: boolean;
}

export default function Contact({
  contactEmail,
  location,
  address,
  donationUrl,
  registrationOpen,
}: ContactProps) {
  return (
    <section id="contact" className="py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-solstice-gold text-sm font-semibold uppercase tracking-widest">
            Get Involved
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">
            Join Us
          </h2>
          <p className="text-forest-200 max-w-xl mx-auto">
            Questions about the event, pledging, or volunteering? Reach out to
            the VCRC organising team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <a
            href={`mailto:${contactEmail}`}
            className="card-glass rounded-2xl p-6 text-center hover:bg-white/10 transition-colors group"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-solstice-gold/20 mb-4 group-hover:bg-solstice-gold/30 transition-colors">
              <Mail className="w-6 h-6 text-solstice-gold" />
            </div>
            <h3 className="text-white font-semibold mb-1">Email</h3>
            <p className="text-forest-300 text-sm break-all">{contactEmail}</p>
          </a>

          <div className="card-glass rounded-2xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-solstice-gold/20 mb-4">
              <MapPin className="w-6 h-6 text-solstice-gold" />
            </div>
            <h3 className="text-white font-semibold mb-1">Venue</h3>
            <p className="text-forest-300 text-sm">{location}</p>
            <p className="text-forest-400 text-xs mt-1">{address}</p>
          </div>

          <a
            href={donationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="card-glass rounded-2xl p-6 text-center hover:bg-white/10 transition-colors group"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-solstice-gold/20 mb-4 group-hover:bg-solstice-gold/30 transition-colors">
              <Heart className="w-6 h-6 text-solstice-gold" />
            </div>
            <h3 className="text-white font-semibold mb-1">Donate</h3>
            <p className="text-forest-300 text-sm">
              Pledge $/km or make a flat donation to the BC Amateur Sport Fund.
            </p>
          </a>
        </div>

        {registrationOpen && (
          <div className="card-glass rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              Ready to Row for a Cause?
            </h3>
            <p className="text-forest-200 mb-6">
              Register your team and start collecting pledges. Every kilometer
              counts toward new boats and equipment for VCRC.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-solstice-gold text-forest-950 font-bold rounded-xl hover:bg-solstice-gold-light transition-colors"
              >
                Register Your Team
              </a>
              <a
                href={donationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-solstice-gold/40 text-solstice-gold font-semibold rounded-xl hover:bg-white/10 transition-colors"
              >
                Pledge / Donate
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
