import crypto from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./db";

// Admin password. Once you change it in Admin > Settings, a scrypt hash is kept
// in the database and the ADMIN_PASSWORD env var is only a fallback.
const KEY = "admin_password_hash";

function hash(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  return `scrypt$${salt}$${crypto.scryptSync(password, salt, 64).toString("hex")}`;
}

function matches(password: string, stored: string) {
  const [, salt, hex] = stored.split("$");
  if (!salt || !hex) return false;
  const a = crypto.scryptSync(password, salt, 64);
  const b = Buffer.from(hex, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const storedHash = async () => (await prisma.setting.findUnique({ where: { key: KEY } }))?.value ?? null;

export async function checkAdminPassword(password: string) {
  const stored = await storedHash();
  if (stored) return matches(password, stored);
  const env = process.env.ADMIN_PASSWORD ?? "";
  const a = Buffer.from(password), b = Buffer.from(env);
  return !!env && a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function passwordProblem(pw: string) {
  if (pw.length < 10) return "Use at least 10 characters.";
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) return "Use both letters and numbers.";
  return null;
}

export async function setAdminPassword(password: string) {
  await prisma.setting.upsert({ where: { key: KEY }, create: { key: KEY, value: hash(password) }, update: { value: hash(password) } });
}

// Reset links: signed with ADMIN_SECRET, valid 30 minutes, and tied to the
// current password so a link stops working as soon as it has been used.
const secret = () => new TextEncoder().encode(process.env.ADMIN_SECRET ?? "");
const fingerprint = async () => crypto.createHash("sha256").update((await storedHash()) ?? `env:${process.env.ADMIN_PASSWORD ?? ""}`).digest("hex").slice(0, 16);

export async function createResetToken() {
  return new SignJWT({ purpose: "admin-reset", fp: await fingerprint() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30m")
    .sign(secret());
}

export async function resetTokenIsValid(token: string) {
  if (!token || !process.env.ADMIN_SECRET) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.purpose === "admin-reset" && payload.fp === (await fingerprint());
  } catch {
    return false;
  }
}
