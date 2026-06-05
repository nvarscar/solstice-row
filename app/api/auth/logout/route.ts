import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("solstice_auth");
  return response;
}
