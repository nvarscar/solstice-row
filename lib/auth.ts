import crypto from "crypto";
import fs from "fs";
import path from "path";

const DATA_DIR = process.env.DATA_DIR || "./data";
const CREDS_FILE = path.join(DATA_DIR, "auth", "credentials.json");

export interface Credentials {
  username: string;
  passwordHash: string;
  secret: string;
}

export function getCredentials(): Credentials | null {
  try {
    return JSON.parse(fs.readFileSync(CREDS_FILE, "utf-8"));
  } catch {
    return null;
  }
}

export function saveCredentials(creds: Credentials): void {
  const dir = path.dirname(CREDS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CREDS_FILE, JSON.stringify(creds, null, 2));
}

export function hashPassword(password: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(password).digest("hex");
}

export function verifyPassword(password: string, creds: Credentials): boolean {
  return hashPassword(password, creds.secret) === creds.passwordHash;
}

export function createToken(username: string, secret: string): string {
  const payload = `${username}|${Date.now()}`;
  const sig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return Buffer.from(`${payload}|${sig}`).toString("base64");
}

export function verifyToken(
  token: string,
  creds: Credentials
): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const lastPipe = decoded.lastIndexOf("|");
    if (lastPipe < 0) return null;
    const payload = decoded.slice(0, lastPipe);
    const sig = decoded.slice(lastPipe + 1);
    const expected = crypto
      .createHmac("sha256", creds.secret)
      .update(payload)
      .digest("hex");
    if (sig !== expected) return null;
    const parts = payload.split("|");
    const ts = parseInt(parts[1], 10);
    if (isNaN(ts) || Date.now() - ts > 30 * 24 * 60 * 60 * 1000) return null;
    return parts[0];
  } catch {
    return null;
  }
}
