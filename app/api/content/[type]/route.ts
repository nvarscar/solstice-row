import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { getCredentials, verifyToken } from "@/lib/auth";

const CONTENT_DIR = path.join(process.cwd(), "content");
const ALLOWED = ["event", "schedule", "teams", "sponsors"];

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
  try {
    const data = JSON.parse(
      fs.readFileSync(path.join(CONTENT_DIR, `${type}.json`), "utf-8")
    );
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
  try {
    const body = await request.json();
    fs.writeFileSync(
      path.join(CONTENT_DIR, `${type}.json`),
      JSON.stringify(body, null, 2)
    );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
