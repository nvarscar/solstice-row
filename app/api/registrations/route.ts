import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const TEAMS_FILE = path.join(process.cwd(), "content", "teams.json");

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, captain, captainEmail, members } = body;

    if (!name?.trim() || !captain?.trim() || !captainEmail?.trim() || !members) {
      return NextResponse.json(
        { error: "Missing required fields: name, captain, captainEmail, members" },
        { status: 400 }
      );
    }

    const data = JSON.parse(fs.readFileSync(TEAMS_FILE, "utf-8"));

    const baseId = slugify(String(name));
    let id = baseId;
    let n = 1;
    while (data.teams.some((t: { id: string }) => t.id === id)) {
      id = `${baseId}-${n++}`;
    }

    const newTeam = {
      id,
      name: String(name).trim(),
      captain: String(captain).trim(),
      captainEmail: String(captainEmail).trim(),
      captainPhone: String(body.captainPhone || "").trim(),
      club: String(body.club || "").trim(),
      members: Math.max(1, parseInt(String(members)) || 1),
      pledgePerKm: Math.max(0, parseFloat(String(body.pledgePerKm || "0")) || 0),
      boatM: 0,
      ergM: 0,
      notes: String(body.notes || "").trim(),
      status: "pending",
      registeredAt: new Date().toISOString(),
    };

    data.teams.push(newTeam);
    fs.writeFileSync(TEAMS_FILE, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: "Failed to register team" }, { status: 500 });
  }
}
