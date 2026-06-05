import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getCredentials,
  verifyPassword,
  hashPassword,
  saveCredentials,
  verifyToken,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("solstice_auth")?.value;
  const creds = getCredentials();

  if (!creds || !token || !verifyToken(token, creds)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json();

  if (!verifyPassword(currentPassword, creds)) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 400 }
    );
  }

  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters" },
      { status: 400 }
    );
  }

  creds.passwordHash = hashPassword(newPassword, creds.secret);
  saveCredentials(creds);

  return NextResponse.json({ success: true });
}
