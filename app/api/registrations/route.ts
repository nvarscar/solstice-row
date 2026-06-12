import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY ?? null;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

async function verifyTurnstileToken(token: string): Promise<boolean> {
  if (!TURNSTILE_SECRET_KEY) {
    console.error("TURNSTILE_SECRET_KEY is not configured — registration blocked");
    return false;
  }
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

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EMAIL_RE.test(String(captainEmail).trim())) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const MAX_LENGTHS: Record<string, number> = {
      name: 100, captain: 100, captainEmail: 254,
      captainPhone: 30, club: 100, notes: 1000,
    };
    for (const [field, max] of Object.entries(MAX_LENGTHS)) {
      if (String(body[field] ?? "").length > max) {
        return NextResponse.json(
          { error: `Field "${field}" exceeds maximum length of ${max} characters` },
          { status: 400 }
        );
      }
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
