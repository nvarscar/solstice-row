import { getDb } from "@/lib/db";
import {
  getPhotoSections,
  listEventPhotos,
  listTeamPhotos,
  listBeforeAfterPairs,
  hasAnyEnabledSection,
} from "@/lib/db-photos";
import Link from "next/link";
import { ArrowLeft, Camera, Users, Repeat2 } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import TeamSlideshow from "./TeamSlideshow";
import BeforeAfterCard from "./BeforeAfterCard";
import EventPhotoGallery from "./EventPhotoGallery";
import eventData from "@/content/event.json";

export const dynamic = "force-dynamic";

function getTzAbbr(tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en", { timeZone: tz, timeZoneName: "short" }).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value ?? tz;
  } catch {
    return tz;
  }
}

export default function PhotosPage() {
  const db = getDb();
  const sections = getPhotoSections(db);
  const eventPhotos = sections.event ? listEventPhotos(db) : [];
  const teamPhotos = sections.teams ? listTeamPhotos(db) : [];
  const beforeAfterPairs = sections.before_after ? listBeforeAfterPairs(db) : [];

  const photosEnabled = hasAnyEnabledSection(db);
  const tzRow = db.prepare("SELECT value FROM meta WHERE key = 'eventTimezone'").get() as { value: string } | undefined;
  const timezone = tzRow?.value ?? "America/Vancouver";
  const tzAbbr = getTzAbbr(timezone);

  // Group team photos by team_id
  const teamGroups: Record<string, { teamId: string; teamName?: string; photoIds: string[] }> = {};
  for (const p of teamPhotos) {
    if (!teamGroups[p.team_id]) {
      teamGroups[p.team_id] = { teamId: p.team_id, photoIds: [] };
    }
    teamGroups[p.team_id].photoIds.push(p.id);
  }
  // Enrich with team names
  if (Object.keys(teamGroups).length > 0) {
    const ids = Object.keys(teamGroups);
    const placeholders = ids.map(() => "?").join(",");
    const rows = db
      .prepare(`SELECT id, name FROM teams WHERE id IN (${placeholders})`)
      .all(...ids) as { id: string; name: string }[];
    for (const row of rows) {
      if (teamGroups[row.id]) teamGroups[row.id].teamName = row.name;
    }
  }
  const teamGroupList = Object.values(teamGroups).filter((g) => g.photoIds.length > 0);

  const hasEvent = sections.event && eventPhotos.length > 0;
  const hasTeams = sections.teams && teamGroupList.length > 0;
  const hasBeforeAfter = sections.before_after && beforeAfterPairs.length > 0;
  const isEmpty = !hasEvent && !hasTeams && !hasBeforeAfter;

  return (
    <>
      <Nav registrationOpen={eventData.registrationOpen} photosEnabled={photosEnabled} />

      <main className="min-h-screen pt-20">
        {/* Page Header */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-forest-400 hover:text-forest-100 text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to main page
          </Link>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            <span className="gold-shimmer">{eventData.name}</span>
          </h1>
          <p className="text-forest-300 text-lg">Event Photos · {eventData.edition}</p>
        </div>

        {isEmpty ? (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
            <div className="card-glass rounded-2xl p-16 text-center">
              <Camera className="w-12 h-12 text-forest-500 mx-auto mb-4" />
              <p className="text-forest-300 text-lg">Photos coming soon!</p>
              <p className="text-forest-500 text-sm mt-1">Check back after the event.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-20 pb-24">
            {/* ── Event Photos ─────────────────────────────────────────── */}
            {hasEvent && (
              <section className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex items-center gap-3 mb-8">
                  <Camera className="w-6 h-6 text-solstice-gold" />
                  <h2 className="text-2xl font-bold text-white">Event Photos</h2>
                </div>
                <EventPhotoGallery photos={eventPhotos} />
              </section>
            )}

            {/* ── Team Slideshows ───────────────────────────────────────── */}
            {hasTeams && (
              <section className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex items-center gap-3 mb-8">
                  <Users className="w-6 h-6 text-solstice-gold" />
                  <h2 className="text-2xl font-bold text-white">Team Galleries</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teamGroupList.map((group) => (
                    <TeamSlideshow
                      key={group.teamId}
                      teamName={group.teamName ?? group.teamId}
                      photoIds={group.photoIds}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── Before & After ────────────────────────────────────────── */}
            {hasBeforeAfter && (
              <section className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex items-center gap-3 mb-3">
                  <Repeat2 className="w-6 h-6 text-solstice-gold" />
                  <h2 className="text-2xl font-bold text-white">The Grind</h2>
                </div>
                <p className="text-forest-400 text-sm mb-8">
                  Drag the divider to see each team from start to finish.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {beforeAfterPairs.map((pair) => (
                    <BeforeAfterCard
                      key={pair.id}
                      teamName={pair.team_name ?? pair.team_id}
                      beforeId={pair.before_id}
                      afterId={pair.after_id}
                      shiftMinutes={pair.shift_minutes}
                      startTime={pair.before_taken_at}
                      endTime={pair.after_taken_at}
                      tzAbbr={tzAbbr}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <Footer
        name={eventData.name}
        edition={eventData.edition}
        contactEmail={eventData.contactEmail}
      />
    </>
  );
}
