import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { getCredentials, verifyToken } from "@/lib/auth";
import { getDb, getAllTeams, getAllScheduleItems, saveScheduleItems } from "@/lib/db";

const CONTENT_DIR = path.join(process.cwd(), "content");
const ALLOWED = ["event", "schedule", "teams", "sponsors"];

function contentFilePath(type: string): string {
  return path.join(CONTENT_DIR, `${type}.json`);
}

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("solstice_auth")?.value;
  if (!token) return false;
  const creds = getCredentials();
  if (!creds) return false;
  return verifyToken(token, creds) !== null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  if (!ALLOWED.includes(type)) {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  }
  if (type === "teams") {
    try {
      return NextResponse.json(getAllTeams(getDb()));
    } catch (err) {
      console.error("Failed to load teams from DB:", err);
      return NextResponse.json({ error: "Failed to load teams" }, { status: 500 });
    }
  }
  if (type === "schedule") {
    try {
      return NextResponse.json({ items: getAllScheduleItems(getDb()) });
    } catch (err) {
      console.error("Failed to load schedule from DB:", err);
      return NextResponse.json({ error: "Failed to load schedule" }, { status: 500 });
    }
  }
  try {
    const data = JSON.parse(fs.readFileSync(contentFilePath(type), "utf-8"));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { type } = await params;
  if (!ALLOWED.includes(type)) {
    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  }
  if (type === "teams") {
    return NextResponse.json(
      { error: "Use PATCH /api/content/teams/:id for individual team updates" },
      { status: 405 }
    );
  }
  if (type === "schedule") {
    try {
      const body = await request.json();
      if (!Array.isArray(body.items)) {
        return NextResponse.json({ error: "Invalid schedule data" }, { status: 400 });
      }
      const sorted = saveScheduleItems(getDb(), body.items);
      return NextResponse.json({ items: sorted });
    } catch {
      return NextResponse.json({ error: "Failed to save schedule" }, { status: 500 });
    }
  }
  try {
    const body = await request.json();
    fs.writeFileSync(contentFilePath(type), JSON.stringify(body, null, 2));
    return NextResponse.json(body);
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
