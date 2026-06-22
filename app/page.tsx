import { getDb, getAllScheduleItems, getAllSponsors, getAllTeams, getEventConfig } from "@/lib/db";
import { hasAnyEnabledSection } from "@/lib/db-photos";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Schedule from "@/components/Schedule";
import Results from "@/components/Results";
import Sponsors from "@/components/Sponsors";
import PhotosBanner from "@/components/PhotosBanner";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default function Home() {
  const db = getDb();
  const eventData = getEventConfig(db);
  const scheduleItems = getAllScheduleItems(db);
  const { tiers: sponsorTiers } = getAllSponsors(db);
  const teamsRaw = getAllTeams(db);
  const teamsData = {
    ...teamsRaw,
    teams: teamsRaw.teams.filter((t) => t.status === "approved"),
  };
  const photosEnabled = hasAnyEnabledSection(db);

  return (
    <main>
      <Nav
        registrationOpen={eventData.registrationOpen}
        photosEnabled={photosEnabled}
      />

      <Hero
        name={eventData.name}
        tagline={eventData.tagline}
        heroSubtitle={eventData.heroSubtitle}
        date={eventData.date}
        location={eventData.location}
        venue={eventData.venue}
        sunriseTime={eventData.sunriseTime}
        sunsetTime={eventData.sunsetTime}
        edition={eventData.edition}
        registrationOpen={eventData.registrationOpen}
        registrationDeadline={eventData.registrationDeadline}
        donationUrl={eventData.donationUrl}
      />

      <About
        description={eventData.description}
        cause={eventData.cause}
        format={eventData.format}
      />

      <Schedule items={scheduleItems} date={eventData.date} />

      <Results teamsData={teamsData} />

      {photosEnabled && <PhotosBanner eventName={eventData.name} />}

      <Sponsors tiers={sponsorTiers} />

      <Contact
        contactEmail={eventData.contactEmail}
        location={eventData.location}
        address={eventData.address}
        donationUrl={eventData.donationUrl}
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
