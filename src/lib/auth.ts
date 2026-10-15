import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "admin_session";
const key = () => new TextEncoder().encode(process.env.ADMIN_SECRET ?? "");

export async function createSession(email: string) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key());
}

export async function verifySession(token?: string) {
  if (!token || !process.env.ADMIN_SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return payload as { email: string };
  } catch {
    return null;
  }
}
