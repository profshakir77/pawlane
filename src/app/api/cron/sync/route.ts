import { NextResponse } from "next/server";
import { runAllSyncs } from "@/lib/sync";
import { sendAbandonedCheckoutReminders } from "@/lib/recovery";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sync = await runAllSyncs();
  const recovery = await sendAbandonedCheckoutReminders().catch((e) => ({ error: String(e) }));
  return NextResponse.json({ sync, recovery });
}
