import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

export interface Team {
  id: string;
  name: string;
  captain: string;
  captainEmail: string;
  captainPhone: string;
  club: string;
  members: number;
  boatM: number;
  ergM: number;
  pledgePerKm: number;
  notes: string;
  status: "pending" | "approved";
  registeredAt: string;
}

export interface TeamsData {
  eventYear: string;
  eventDate: string;
  lastUpdated: string;
  teams: Team[];
}

export interface ScheduleItem {
  time: string;
  title: string;
  description: string;
  category: string;
}

export interface Sponsor {
  name: string;
  url: string;
  logo: string;
}

export interface SponsorTier {
  name: string;
  color: string;
  sponsors: Sponsor[];
}

function parseScheduleMinutes(t: string): number {
  const m = t.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!m) return 0;
  let h = parseInt(m[1]);
  const min = parseInt(m[2]);
  if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
  if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

let _db: Database.Database | null = null;

function dbPath(): string {
  const dataDir = process.env.DATA_DIR;
  if (dataDir) return path.join(dataDir, "teams.db");
  return path.join(process.cwd(), "content", "teams.db");
}

export function getDb(): Database.Database {
  if (_db) return _db;
  _db = new Database(dbPath());
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  initSchema(_db);
  return _db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS schedule_items (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      time         TEXT NOT NULL,
      time_minutes INTEGER NOT NULL DEFAULT 0,
      title        TEXT NOT NULL DEFAULT '',
      description  TEXT NOT NULL DEFAULT '',
      category     TEXT NOT NULL DEFAULT 'row'
    );
    CREATE TABLE IF NOT EXISTS sponsor_tiers (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      name       TEXT NOT NULL,
      color      TEXT NOT NULL DEFAULT 'silver'
    );
    CREATE TABLE IF NOT EXISTS sponsors (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      tier_id    INTEGER NOT NULL REFERENCES sponsor_tiers(id),
      sort_order INTEGER NOT NULL DEFAULT 0,
      name       TEXT NOT NULL DEFAULT '',
      url        TEXT NOT NULL DEFAULT '',
      logo       TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS teams (
      id           TEXT PRIMARY KEY,
      name         TEXT NOT NULL,
      captain      TEXT NOT NULL,
      captainEmail TEXT NOT NULL DEFAULT '',
      captainPhone TEXT NOT NULL DEFAULT '',
      club         TEXT NOT NULL DEFAULT '',
      members      INTEGER NOT NULL DEFAULT 1,
      boatM        INTEGER NOT NULL DEFAULT 0,
      ergM         INTEGER NOT NULL DEFAULT 0,
      pledgePerKm  REAL NOT NULL DEFAULT 0,
      notes        TEXT NOT NULL DEFAULT '',
      status       TEXT NOT NULL DEFAULT 'pending',
      registeredAt TEXT NOT NULL
    );
  `);

  try {
    db.exec("ALTER TABLE sponsor_tiers ADD COLUMN color TEXT NOT NULL DEFAULT 'silver'");
    db.exec("UPDATE sponsor_tiers SET color = 'gold' WHERE LOWER(name) = 'gold'");
    db.exec("UPDATE sponsor_tiers SET color = 'bronze' WHERE LOWER(name) = 'bronze'");
  } catch {
    // column already exists – nothing to do
  }

  const insertMeta = db.prepare("INSERT OR IGNORE INTO meta (key, value) VALUES (?, ?)");
  insertMeta.run("eventYear", new Date().getFullYear().toString());
  insertMeta.run("eventDate", "");
  insertMeta.run("lastUpdated", new Date().toISOString());

  const { sc } = db.prepare("SELECT COUNT(*) as sc FROM schedule_items").get() as { sc: number };
  if (sc === 0) {
    const schedJsonPath = path.join(process.cwd(), "content", "schedule.json");
    if (fs.existsSync(schedJsonPath)) {
      try {
        const raw = JSON.parse(fs.readFileSync(schedJsonPath, "utf-8")) as { items: ScheduleItem[] };
        if (Array.isArray(raw.items)) {
          const insertSched = db.prepare(`
            INSERT INTO schedule_items (time, time_minutes, title, description, category)
            VALUES (@time, @time_minutes, @title, @description, @category)
          `);
          const sorted = [...raw.items].sort(
            (a, b) => parseScheduleMinutes(a.time) - parseScheduleMinutes(b.time)
          );
          db.transaction((items: ScheduleItem[]) => {
            for (const item of items)
              insertSched.run({ ...item, time_minutes: parseScheduleMinutes(item.time) });
          })(sorted);
        }
      } catch {
        // seeding failed; continue with empty schedule
      }
    }
  }

  const { stc } = db.prepare("SELECT COUNT(*) as stc FROM sponsor_tiers").get() as { stc: number };
  if (stc === 0) {
    const sponsorsJsonPath = path.join(process.cwd(), "content", "sponsors.json");
    if (fs.existsSync(sponsorsJsonPath)) {
      try {
        const raw = JSON.parse(fs.readFileSync(sponsorsJsonPath, "utf-8")) as { tiers: SponsorTier[] };
        if (Array.isArray(raw.tiers)) {
          const insertTier = db.prepare(
            "INSERT INTO sponsor_tiers (name, color, sort_order) VALUES (@name, @color, @sort_order)"
          );
          const insertSponsor = db.prepare(
            "INSERT INTO sponsors (tier_id, name, url, logo, sort_order) VALUES (@tier_id, @name, @url, @logo, @sort_order)"
          );
          const colorByName: Record<string, string> = { gold: "gold", bronze: "bronze" };
          db.transaction(() => {
            for (let ti = 0; ti < raw.tiers.length; ti++) {
              const tierColor = colorByName[raw.tiers[ti].name.toLowerCase()] ?? "silver";
              const { lastInsertRowid } = insertTier.run({ name: raw.tiers[ti].name, color: tierColor, sort_order: ti });
              for (let si = 0; si < raw.tiers[ti].sponsors.length; si++) {
                insertSponsor.run({ tier_id: lastInsertRowid, sort_order: si, ...raw.tiers[ti].sponsors[si] });
              }
            }
          })();
        }
      } catch {
        // seeding failed; continue with empty sponsors
      }
    }
  }

  const { c } = db.prepare("SELECT COUNT(*) as c FROM teams").get() as { c: number };
  if (c === 0) {
    const jsonPath = path.join(process.cwd(), "content", "teams.json");
    if (fs.existsSync(jsonPath)) {
      try {
        const raw = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as TeamsData;
        const insert = db.prepare(`
          INSERT OR IGNORE INTO teams
            (id, name, captain, captainEmail, captainPhone, club, members, boatM, ergM,
             pledgePerKm, notes, status, registeredAt)
          VALUES
            (@id, @name, @captain, @captainEmail, @captainPhone, @club, @members, @boatM, @ergM,
             @pledgePerKm, @notes, @status, @registeredAt)
        `);
        db.transaction((teams: Team[]) => {
          for (const t of teams) insert.run(t);
        })(raw.teams);
        if (raw.eventYear) db.prepare("UPDATE meta SET value = ? WHERE key = 'eventYear'").run(raw.eventYear);
        if (raw.eventDate) db.prepare("UPDATE meta SET value = ? WHERE key = 'eventDate'").run(raw.eventDate);
      } catch {
        // seeding failed; continue with empty DB
      }
    }
  }
}

export function getAllScheduleItems(db: Database.Database): ScheduleItem[] {
  return db
    .prepare(
      "SELECT time, title, description, category FROM schedule_items ORDER BY time_minutes ASC"
    )
    .all() as ScheduleItem[];
}

export function saveScheduleItems(
  db: Database.Database,
  items: ScheduleItem[]
): ScheduleItem[] {
  const sorted = [...items].sort(
    (a, b) => parseScheduleMinutes(a.time) - parseScheduleMinutes(b.time)
  );
  db.transaction(() => {
    db.prepare("DELETE FROM schedule_items").run();
    const insert = db.prepare(`
      INSERT INTO schedule_items (time, time_minutes, title, description, category)
      VALUES (@time, @time_minutes, @title, @description, @category)
    `);
    for (const item of sorted)
      insert.run({ ...item, time_minutes: parseScheduleMinutes(item.time) });
  })();
  return sorted;
}

export function getAllTeams(db: Database.Database): TeamsData {
  const rows = db.prepare("SELECT key, value FROM meta").all() as { key: string; value: string }[];
  const meta = Object.fromEntries(rows.map(({ key, value }) => [key, value]));
  const teams = db.prepare("SELECT * FROM teams ORDER BY registeredAt ASC").all() as Team[];
  return {
    eventYear: meta.eventYear ?? "",
    eventDate: meta.eventDate ?? "",
    lastUpdated: meta.lastUpdated ?? new Date().toISOString(),
    teams,
  };
}

export function getAllSponsors(db: Database.Database): { tiers: SponsorTier[] } {
  const tiers = db
    .prepare("SELECT id, name, color FROM sponsor_tiers ORDER BY sort_order ASC")
    .all() as { id: number; name: string; color: string }[];
  const getSponsors = db.prepare(
    "SELECT name, url, logo FROM sponsors WHERE tier_id = ? ORDER BY sort_order ASC"
  );
  return {
    tiers: tiers.map((tier) => ({
      name: tier.name,
      color: tier.color,
      sponsors: getSponsors.all(tier.id) as Sponsor[],
    })),
  };
}

export function saveSponsors(
  db: Database.Database,
  tiers: SponsorTier[]
): { tiers: SponsorTier[] } {
  db.transaction(() => {
    db.prepare("DELETE FROM sponsors").run();
    db.prepare("DELETE FROM sponsor_tiers").run();
    const insertTier = db.prepare(
      "INSERT INTO sponsor_tiers (name, color, sort_order) VALUES (@name, @color, @sort_order)"
    );
    const insertSponsor = db.prepare(
      "INSERT INTO sponsors (tier_id, name, url, logo, sort_order) VALUES (@tier_id, @name, @url, @logo, @sort_order)"
    );
    for (let ti = 0; ti < tiers.length; ti++) {
      const { lastInsertRowid } = insertTier.run({ name: tiers[ti].name, color: tiers[ti].color ?? "silver", sort_order: ti });
      for (let si = 0; si < tiers[ti].sponsors.length; si++) {
        insertSponsor.run({ tier_id: lastInsertRowid, sort_order: si, ...tiers[ti].sponsors[si] });
      }
    }
  })();
  return { tiers };
}
