import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { getCredentials, verifyToken } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  deleteEventPhoto,
  deleteTeamPhoto,
  deleteBeforeAfterPair,
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

function removeFile(subdir: string, filename: string): void {
  const filePath = path.join(photosDir(), subdir, filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

function removeThumb(uuid: string): void {
  const thumbPath = path.join(photosDir(), "thumbs", `${uuid}.jpg`);
  if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
}

function removeBeforeAfterFile(uuid: string): void {
  const dir = path.join(photosDir(), "before_after");
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  const match = files.find((f) => f.startsWith(uuid + "."));
  if (match) fs.unlinkSync(path.join(dir, match));
  removeThumb(uuid);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { uuid } = await params;
  const db = getDb();

  // Try event photo
  const evRow = deleteEventPhoto(db, uuid);
  if (evRow) {
    removeFile("event", evRow.filename);
    removeThumb(uuid);
    return NextResponse.json({ success: true });
  }

  // Try team photo
  const teamRow = deleteTeamPhoto(db, uuid);
  if (teamRow) {
    removeFile("teams", teamRow.filename);
    removeThumb(uuid);
    return NextResponse.json({ success: true });
  }

  // Try before/after pair (uuid is the pair id)
  const pairRow = deleteBeforeAfterPair(db, uuid);
  if (pairRow) {
    removeBeforeAfterFile(pairRow.before_id);
    removeBeforeAfterFile(pairRow.after_id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
