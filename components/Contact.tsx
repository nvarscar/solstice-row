import { Mail, Phone, MapPin } from "lucide-react";

interface ContactProps {
  contactEmail: string;
  contactPhone: string;
  location: string;
  registrationUrl: string;
  registrationOpen: boolean;
}

export default function Contact({
  contactEmail,
  contactPhone,
  location,
  registrationUrl,
  registrationOpen,
}: ContactProps) {
  return (
    <section id="contact" className="py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-solstice-gold text-sm font-semibold uppercase tracking-widest">
            Get In Touch
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mt-3 mb-4">
            Contact Us
          </h2>
          <p className="text-blue-200 max-w-xl mx-auto">
            Questions about the event, sponsorship, or volunteering? We&apos;d
            love to hear from you.
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
            <p className="text-blue-300 text-sm break-all">{contactEmail}</p>
          </a>

          <a
            href={`tel:${contactPhone.replace(/\D/g, "")}`}
            className="card-glass rounded-2xl p-6 text-center hover:bg-white/10 transition-colors group"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-solstice-gold/20 mb-4 group-hover:bg-solstice-gold/30 transition-colors">
              <Phone className="w-6 h-6 text-solstice-gold" />
            </div>
            <h3 className="text-white font-semibold mb-1">Phone</h3>
            <p className="text-blue-300 text-sm">{contactPhone}</p>
          </a>

          <div className="card-glass rounded-2xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-solstice-gold/20 mb-4">
              <MapPin className="w-6 h-6 text-solstice-gold" />
            </div>
            <h3 className="text-white font-semibold mb-1">Venue</h3>
            <p className="text-blue-300 text-sm">{location}</p>
          </div>
        </div>

        {registrationOpen && (
          <div className="card-glass rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              Ready to Row?
            </h3>
            <p className="text-blue-200 mb-6">
              Spots fill up fast. Register now to secure your place on the water.
            </p>
            <a
              href={registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-solstice-gold text-navy-900 font-bold rounded-xl hover:bg-solstice-dawn transition-colors"
            >
              Register for the Event
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
