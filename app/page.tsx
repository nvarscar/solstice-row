import fs from "fs";
import path from "path";
import { getDb, getAllScheduleItems, getAllSponsors } from "@/lib/db";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Schedule from "@/components/Schedule";
import Results from "@/components/Results";
import Sponsors from "@/components/Sponsors";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

import eventData from "@/content/event.json";

export const dynamic = "force-dynamic";

export default function Home() {
  const db = getDb();
  const scheduleItems = getAllScheduleItems(db);
  const { tiers: sponsorTiers } = getAllSponsors(db);
  const teamsRaw = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "content", "teams.json"), "utf-8")
  );
  const teamsData = {
    ...teamsRaw,
    teams: teamsRaw.teams.filter((t: { status?: string }) => t.status === "approved"),
  };

  return (
    <main>
      <Nav
        registrationOpen={eventData.registrationOpen}
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
