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
