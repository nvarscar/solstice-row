import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Schedule from "@/components/Schedule";
import Results from "@/components/Results";
import Sponsors from "@/components/Sponsors";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

import eventData from "@/content/event.json";
import scheduleData from "@/content/schedule.json";
import resultsData from "@/content/results.json";
import sponsorsData from "@/content/sponsors.json";

export default function Home() {
  return (
    <main>
      <Nav
        registrationUrl={eventData.registrationUrl}
        registrationOpen={eventData.registrationOpen}
      />

      <Hero
        name={eventData.name}
        tagline={eventData.tagline}
        heroSubtitle={eventData.heroSubtitle}
        date={eventData.date}
        location={eventData.location}
        startTime={eventData.startTime}
        edition={eventData.edition}
        registrationUrl={eventData.registrationUrl}
        registrationOpen={eventData.registrationOpen}
        registrationDeadline={eventData.registrationDeadline}
      />

      <About
        description={eventData.description}
        location={eventData.location}
        date={eventData.date}
      />

      <Schedule items={scheduleData.items} />

      <Results years={resultsData.years} />

      <Sponsors tiers={sponsorsData.tiers} />

      <Contact
        contactEmail={eventData.contactEmail}
        contactPhone={eventData.contactPhone}
        location={eventData.location}
        registrationUrl={eventData.registrationUrl}
        registrationOpen={eventData.registrationOpen}
      />

      <Footer
        name={eventData.name}
        edition={eventData.edition}
        contactEmail={eventData.contactEmail}
      />
    </main>
  );
}
