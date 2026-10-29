import { NextResponse } from "next/server";
import { passwordProblem, resetTokenIsValid, setAdminPassword } from "@/lib/admin-password";

export async function POST(req: Request) {
  const { token = "", password = "" } = await req.json().catch(() => ({}));
  if (!(await resetTokenIsValid(String(token)))) {
    return NextResponse.json({ error: "This link has expired or was already used. Ask for a new one." }, { status: 400 });
  }
  const problem = passwordProblem(String(password));
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  await setAdminPassword(String(password));
  return NextResponse.json({ ok: true });
}
