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
