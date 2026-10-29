import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, createSession } from "@/lib/auth";
import { checkAdminPassword } from "@/lib/admin-password";

function same(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function POST(req: Request) {
  const { email = "", password = "" } = await req.json().catch(() => ({}));
  const okEmail = same(String(email).toLowerCase(), String(process.env.ADMIN_EMAIL ?? "").toLowerCase());
  const okPass = await checkAdminPassword(String(password));
  if (!okEmail || !okPass) {
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSession(email), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 7 * 24 * 3600,
  });
  return res;
}
