import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCredentials, verifyToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  getPhotoSections,
  setPhotoSection,
  listEventPhotos,
  listTeamPhotos,
  listBeforeAfterPairs,
  type PhotoSection,
} from "@/lib/db-photos";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("solstice_auth")?.value;
  if (!token) return false;
  const creds = getCredentials();
  if (!creds) return false;
  return verifyToken(token, creds) !== null;
}

function getTimezone(db: ReturnType<typeof getDb>): string {
  const row = db.prepare("SELECT value FROM meta WHERE key = 'eventTimezone'").get() as
    | { value: string }
    | undefined;
  return row?.value ?? "America/Vancouver";
}

export async function GET() {
  const db = getDb();
  const sections = getPhotoSections(db);
  const eventPhotos = listEventPhotos(db);
  const teamPhotos = listTeamPhotos(db);
  const beforeAfterPairs = listBeforeAfterPairs(db);
  const timezone = getTimezone(db);

  return NextResponse.json({ sections, eventPhotos, teamPhotos, beforeAfterPairs, timezone });
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const body = (await request.json()) as {
    section?: PhotoSection;
    enabled?: boolean;
    timezone?: string;
  };

  if (body.timezone !== undefined) {
    db.prepare("UPDATE meta SET value = ? WHERE key = 'eventTimezone'").run(body.timezone);
    return NextResponse.json({ success: true });
  }

  if (!body.section || typeof body.enabled !== "boolean") {
    return NextResponse.json({ error: "section+enabled or timezone required" }, { status: 400 });
  }

  setPhotoSection(db, body.section, body.enabled);
  return NextResponse.json({ success: true });
}
