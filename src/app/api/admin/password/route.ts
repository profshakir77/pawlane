import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { checkAdminPassword, passwordProblem, setAdminPassword } from "@/lib/admin-password";

export async function POST(req: Request) {
  await requireAdmin();
  const { current = "", password = "" } = await req.json().catch(() => ({}));
  if (!(await checkAdminPassword(String(current)))) {
    return NextResponse.json({ error: "Your current password is not right." }, { status: 400 });
  }
  const problem = passwordProblem(String(password));
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  await setAdminPassword(String(password));
  return NextResponse.json({ ok: true });
}
