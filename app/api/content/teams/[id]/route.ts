import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCredentials, verifyToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

const PATCHABLE = new Set([
  "name", "captain", "captainEmail", "captainPhone", "club",
  "members", "boatM", "ergM", "pledgePerKm", "notes", "status",
]);

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("solstice_auth")?.value;
  if (!token) return false;
  const creds = getCredentials();
  if (!creds) return false;
  return verifyToken(token, creds) !== null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;
  const db = getDb();

  if (!db.prepare("SELECT id FROM teams WHERE id = ?").get(id)) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const setClauses: string[] = [];
  const updateData: Record<string, unknown> = { _id: id };
  for (const key of Object.keys(body)) {
    if (PATCHABLE.has(key)) {
      setClauses.push(`${key} = @${key}`);
      updateData[key] = body[key];
    }
  }
  if (setClauses.length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  db.prepare(`UPDATE teams SET ${setClauses.join(", ")} WHERE id = @_id`).run(updateData);
  db.prepare("UPDATE meta SET value = ? WHERE key = 'lastUpdated'").run(new Date().toISOString());

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const db = getDb();
  const result = db.prepare("DELETE FROM teams WHERE id = ?").run(id);
  if (result.changes === 0) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }
  db.prepare("UPDATE meta SET value = ? WHERE key = 'lastUpdated'").run(new Date().toISOString());
  return NextResponse.json({ success: true });
}
