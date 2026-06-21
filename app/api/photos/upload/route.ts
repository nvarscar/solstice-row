import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { getCredentials, verifyToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  insertEventPhoto,
  insertTeamPhoto,
  insertBeforeAfterPair,
} from "@/lib/db-photos";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("solstice_auth")?.value;
  if (!token) return false;
  const creds = getCredentials();
  if (!creds) return false;
  return verifyToken(token, creds) !== null;
}

function photosDir(): string {
  const base = process.env.DATA_DIR ?? path.join(process.cwd(), "content");
  return path.join(base, "photos");
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

interface ExifResult {
  time: string;          // "HH:MM" derived from EXIF DateTimeOriginal
  minutesSinceEpoch: number; // for computing shift duration diff
}

async function extractExifTime(buffer: Buffer, timezone: string): Promise<ExifResult | null> {
  try {
    const exifr = (await import("exifr")).default;
    // reviveValues:false keeps datetime and offset tags as raw strings.
    const exif = await exifr.parse(buffer, {
      pick: [
        "DateTimeOriginal", "CreateDate",
        // EXIF 2.31+ UTC offset tags for DateTimeOriginal / general
        "OffsetTimeOriginal", "OffsetTime", "OffsetTimeDigitized",
      ],
      reviveValues: false,
    });

    const raw: string | undefined = exif?.DateTimeOriginal ?? exif?.CreateDate;
    if (typeof raw !== "string" || raw.length < 16) return null;

    // Offset tag e.g. "-07:00" or "+05:30"; prefer the most specific one.
    const offset: string | undefined =
      exif?.OffsetTimeOriginal ?? exif?.OffsetTime ?? exif?.OffsetTimeDigitized;

    // Normalise EXIF date part "YYYY:MM:DD" → "YYYY-MM-DD"
    const base = raw.replace(/^(\d{4}):(\d{2}):(\d{2}) /, "$1-$2-$3T");
    const iso = offset
      ? base + offset          // exact timestamp — no guessing needed
      : base + "Z";            // no offset tag → assume camera was in UTC (fallback)

    const dt = new Date(iso);
    if (isNaN(dt.getTime())) return null;

    // Convert the UTC instant to the configured event timezone for display.
    const time = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(dt).substring(0, 5); // "HH:MM"

    return { time, minutesSinceEpoch: Math.floor(dt.getTime() / 60000) };
  } catch {
    // EXIF not available or parse failed
  }
  return null;
}

async function saveFile(
  buffer: Buffer,
  subdir: string,
  ext: string
): Promise<{ uuid: string; filename: string }> {
  const uuid = randomUUID();
  const filename = `${uuid}${ext}`;
  const dir = path.join(photosDir(), subdir);
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, filename), buffer);
  return { uuid, filename };
}

async function saveThumbnail(buffer: Buffer, uuid: string): Promise<void> {
  const thumbsDir = path.join(photosDir(), "thumbs");
  ensureDir(thumbsDir);
  await sharp(buffer)
    .resize(400, 400, { fit: "cover", position: "centre" })
    .jpeg({ quality: 80 })
    .toFile(path.join(thumbsDir, `${uuid}.jpg`));
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart data" }, { status: 400 });
  }

  const type = formData.get("type") as string;
  const db = getDb();

  // before_after_pair commits already-uploaded files — no new file needed
  if (type === "before_after_pair") {
    try {
      const teamId = formData.get("teamId") as string;
      const beforeId = formData.get("beforeId") as string;
      const afterId = formData.get("afterId") as string;
      const shiftStr = formData.get("shiftMinutes") as string | null;
      const shiftMinutes = shiftStr ? parseInt(shiftStr, 10) || null : null;
      if (!teamId || !beforeId || !afterId) {
        return NextResponse.json({ error: "teamId, beforeId, afterId required" }, { status: 400 });
      }
      const beforeTime = (formData.get("beforeTime") as string | null) || null;
      const afterTime = (formData.get("afterTime") as string | null) || null;
      const pairId = randomUUID();
      insertBeforeAfterPair(db, pairId, teamId, beforeId, afterId, shiftMinutes, beforeTime, afterTime);
      return NextResponse.json({ id: pairId });
    } catch (err) {
      console.error("Photo pair commit error:", err);
      return NextResponse.json({ error: "Pair commit failed" }, { status: 500 });
    }
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const extMap: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };
  const ext = extMap[file.type] ?? ".jpg";

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    if (type === "event") {
      const description = (formData.get("description") as string) ?? "";
      const { uuid, filename } = await saveFile(buffer, "event", ext);
      await saveThumbnail(buffer, uuid);
      insertEventPhoto(db, uuid, filename, description);
      return NextResponse.json({ id: uuid, filename });
    }

    if (type === "team") {
      const teamId = formData.get("teamId") as string;
      if (!teamId) return NextResponse.json({ error: "teamId required" }, { status: 400 });
      const { uuid, filename } = await saveFile(buffer, "teams", ext);
      await saveThumbnail(buffer, uuid);
      insertTeamPhoto(db, uuid, teamId, filename);
      return NextResponse.json({ id: uuid, filename });
    }

    if (type === "before_after_file") {
      const role = formData.get("role") as "before" | "after";
      if (!role) return NextResponse.json({ error: "role required" }, { status: 400 });
      const { uuid, filename } = await saveFile(buffer, "before_after", ext);
      await saveThumbnail(buffer, uuid);
      const tzRow = db.prepare("SELECT value FROM meta WHERE key = 'eventTimezone'").get() as { value: string } | undefined;
      const timezone = tzRow?.value ?? "America/Vancouver";
      const exif = await extractExifTime(buffer, timezone);
      return NextResponse.json({ id: uuid, filename, exifTime: exif?.time ?? null, exifMinutes: exif?.minutesSinceEpoch ?? null });
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (err) {
    console.error("Photo upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
