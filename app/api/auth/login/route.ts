import { NextRequest, NextResponse } from "next/server";
import { getCredentials, verifyPassword, createToken, isLegacyHash, hashPassword, saveCredentials } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  const creds = getCredentials();
  if (!creds) {
    return NextResponse.json(
      { error: "Server not initialized. Check Docker logs for initial password." },
      { status: 500 }
    );
  }

  if (username !== creds.username || !verifyPassword(password, creds)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (isLegacyHash(creds.passwordHash)) {
    creds.passwordHash = hashPassword(password);
    saveCredentials(creds);
  }

  const token = createToken(username, creds.secret);
  const response = NextResponse.json({ success: true });
  response.cookies.set("solstice_auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
  return response;
}
