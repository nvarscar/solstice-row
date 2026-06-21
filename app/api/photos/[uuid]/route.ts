import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getDb } from "@/lib/db";

function photosDir(): string {
  const base = process.env.DATA_DIR ?? path.join(process.cwd(), "content");
  return path.join(base, "photos");
}

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function findPhotoFile(uuid: string): string | null {
  const db = getDb();
  // Search all three tables for the uuid
  const eventRow = db.prepare("SELECT filename FROM event_photos WHERE id = ?").get(uuid) as { filename: string } | undefined;
  if (eventRow) return path.join(photosDir(), "event", eventRow.filename);

  const teamRow = db.prepare("SELECT filename FROM team_photos WHERE id = ?").get(uuid) as { filename: string } | undefined;
  if (teamRow) return path.join(photosDir(), "teams", teamRow.filename);

  // before_after files are saved as {uuid}.{ext} — scan directly
  const baDir = path.join(photosDir(), "before_after");
  if (fs.existsSync(baDir)) {
    const files = fs.readdirSync(baDir);
    const match = files.find((f) => f.startsWith(uuid + "."));
    if (match) return path.join(baDir, match);
  }
  return null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;
  const filePath = findPhotoFile(uuid);

  if (!filePath || !fs.existsSync(filePath)) {
    return new NextResponse(null, { status: 404 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] ?? "application/octet-stream";
  const buffer = fs.readFileSync(filePath);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mime,
      "Content-Disposition": "inline",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
