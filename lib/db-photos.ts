import type Database from "better-sqlite3";

export type PhotoSection = "event" | "teams" | "before_after";

export interface PhotoSectionRow {
  section: PhotoSection;
  enabled: boolean;
}

export interface EventPhoto {
  id: string;
  filename: string;
  description: string;
  sort_order: number;
  created_at: string;
}

export interface TeamPhoto {
  id: string;
  team_id: string;
  filename: string;
  sort_order: number;
  created_at: string;
}

export interface BeforeAfterPair {
  id: string;
  team_id: string;
  team_name?: string;
  before_id: string;
  after_id: string;
  shift_minutes: number | null;
  before_taken_at: string | null;
  after_taken_at: string | null;
  created_at: string;
}

export function getPhotoSections(db: Database.Database): Record<PhotoSection, boolean> {
  const rows = db
    .prepare("SELECT section, enabled FROM photo_sections")
    .all() as { section: string; enabled: number }[];
  const result: Record<PhotoSection, boolean> = { event: false, teams: false, before_after: false };
  for (const row of rows) {
    result[row.section as PhotoSection] = row.enabled === 1;
  }
  return result;
}

export function setPhotoSection(
  db: Database.Database,
  section: PhotoSection,
  enabled: boolean
): void {
  db.prepare("UPDATE photo_sections SET enabled = ? WHERE section = ?").run(enabled ? 1 : 0, section);
}

export function hasAnyEnabledSection(db: Database.Database): boolean {
  const row = db
    .prepare("SELECT COUNT(*) as c FROM photo_sections WHERE enabled = 1")
    .get() as { c: number };
  return row.c > 0;
}

// ── Event Photos ────────────────────────────────────────────────────────────

export function listEventPhotos(db: Database.Database): EventPhoto[] {
  return db
    .prepare("SELECT id, filename, description, sort_order, created_at FROM event_photos ORDER BY sort_order ASC, created_at ASC")
    .all() as EventPhoto[];
}

export function insertEventPhoto(
  db: Database.Database,
  id: string,
  filename: string,
  description: string
): void {
  const maxRow = db.prepare("SELECT COALESCE(MAX(sort_order), -1) as m FROM event_photos").get() as { m: number };
  db.prepare(
    "INSERT INTO event_photos (id, filename, description, sort_order, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(id, filename, description, maxRow.m + 1, new Date().toISOString());
}

export function updateEventPhotoDescription(
  db: Database.Database,
  id: string,
  description: string
): void {
  db.prepare("UPDATE event_photos SET description = ? WHERE id = ?").run(description, id);
}

export function deleteEventPhoto(db: Database.Database, id: string): EventPhoto | undefined {
  const row = db.prepare("SELECT * FROM event_photos WHERE id = ?").get(id) as EventPhoto | undefined;
  if (row) db.prepare("DELETE FROM event_photos WHERE id = ?").run(id);
  return row;
}

// ── Team Photos ──────────────────────────────────────────────────────────────

export function listTeamPhotos(db: Database.Database): TeamPhoto[] {
  return db
    .prepare("SELECT id, team_id, filename, sort_order, created_at FROM team_photos ORDER BY team_id, sort_order ASC, created_at ASC")
    .all() as TeamPhoto[];
}

export function listTeamPhotosForTeam(db: Database.Database, teamId: string): TeamPhoto[] {
  return db
    .prepare("SELECT id, team_id, filename, sort_order, created_at FROM team_photos WHERE team_id = ? ORDER BY sort_order ASC, created_at ASC")
    .all(teamId) as TeamPhoto[];
}

export function insertTeamPhoto(
  db: Database.Database,
  id: string,
  teamId: string,
  filename: string
): void {
  const maxRow = db
    .prepare("SELECT COALESCE(MAX(sort_order), -1) as m FROM team_photos WHERE team_id = ?")
    .get(teamId) as { m: number };
  db.prepare(
    "INSERT INTO team_photos (id, team_id, filename, sort_order, created_at) VALUES (?, ?, ?, ?, ?)"
  ).run(id, teamId, filename, maxRow.m + 1, new Date().toISOString());
}

export function deleteTeamPhoto(db: Database.Database, id: string): TeamPhoto | undefined {
  const row = db.prepare("SELECT * FROM team_photos WHERE id = ?").get(id) as TeamPhoto | undefined;
  if (row) db.prepare("DELETE FROM team_photos WHERE id = ?").run(id);
  return row;
}

// ── Before/After Pairs ───────────────────────────────────────────────────────

export function listBeforeAfterPairs(db: Database.Database): BeforeAfterPair[] {
  return db
    .prepare(`
      SELECT p.id, p.team_id, t.name as team_name, p.before_id, p.after_id,
             p.shift_minutes, p.before_taken_at, p.after_taken_at, p.created_at
      FROM before_after_pairs p
      LEFT JOIN teams t ON t.id = p.team_id
      ORDER BY p.created_at ASC
    `)
    .all() as BeforeAfterPair[];
}

export function insertBeforeAfterPair(
  db: Database.Database,
  id: string,
  teamId: string,
  beforeId: string,
  afterId: string,
  shiftMinutes: number | null,
  beforeTakenAt: string | null,
  afterTakenAt: string | null
): void {
  db.prepare(
    `INSERT INTO before_after_pairs
       (id, team_id, before_id, after_id, shift_minutes, before_taken_at, after_taken_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, teamId, beforeId, afterId, shiftMinutes ?? null, beforeTakenAt ?? null, afterTakenAt ?? null, new Date().toISOString());
}

export function updateBeforeAfterShift(
  db: Database.Database,
  id: string,
  shiftMinutes: number | null
): void {
  db.prepare("UPDATE before_after_pairs SET shift_minutes = ? WHERE id = ?").run(shiftMinutes ?? null, id);
}

export function deleteBeforeAfterPair(
  db: Database.Database,
  id: string
): BeforeAfterPair | undefined {
  const row = db.prepare("SELECT * FROM before_after_pairs WHERE id = ?").get(id) as BeforeAfterPair | undefined;
  if (row) db.prepare("DELETE FROM before_after_pairs WHERE id = ?").run(id);
  return row;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function formatShiftDuration(minutes: number | null | undefined): string {
  if (minutes == null || minutes <= 0) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
