import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || "1x0000000000000000000000000000000AA";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

async function verifyTurnstileToken(token: string): Promise<boolean> {
  const formData = new URLSearchParams();
  formData.append("secret", TURNSTILE_SECRET_KEY);
  formData.append("response", token);

  try {
    const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const outcome = await result.json();
    return outcome.success === true;
  } catch (err) {
    console.error("Turnstile verification error:", err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, captain, captainEmail, members, turnstileToken } = body;

    if (!name?.trim() || !captain?.trim() || !captainEmail?.trim() || !members) {
      return NextResponse.json(
        { error: "Missing required fields: name, captain, captainEmail, members" },
        { status: 400 }
      );
    }

    if (!turnstileToken) {
      return NextResponse.json(
        { error: "CAPTCHA verification required. Please complete the challenge." },
        { status: 400 }
      );
    }

    const isValidToken = await verifyTurnstileToken(turnstileToken);
    if (!isValidToken) {
      return NextResponse.json(
        { error: "CAPTCHA verification failed. Please try again." },
        { status: 400 }
      );
    }

    const db = getDb();

    const baseId = slugify(String(name));
    let id = baseId;
    let n = 1;
    while (db.prepare("SELECT id FROM teams WHERE id = ?").get(id)) {
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

    db.prepare(`
      INSERT INTO teams
        (id, name, captain, captainEmail, captainPhone, club, members, boatM, ergM,
         pledgePerKm, notes, status, registeredAt)
      VALUES
        (@id, @name, @captain, @captainEmail, @captainPhone, @club, @members, @boatM, @ergM,
         @pledgePerKm, @notes, @status, @registeredAt)
    `).run(newTeam);

    db.prepare("UPDATE meta SET value = ? WHERE key = 'lastUpdated'").run(new Date().toISOString());

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: "Failed to register team" }, { status: 500 });
  }
}
