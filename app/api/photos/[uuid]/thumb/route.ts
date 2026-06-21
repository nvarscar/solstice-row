import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function photosDir(): string {
  const base = process.env.DATA_DIR ?? path.join(process.cwd(), "content");
  return path.join(base, "photos");
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;
  const thumbPath = path.join(photosDir(), "thumbs", `${uuid}.jpg`);

  if (!fs.existsSync(thumbPath)) {
    return new NextResponse(null, { status: 404 });
  }

  const buffer = fs.readFileSync(thumbPath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Disposition": "inline",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
