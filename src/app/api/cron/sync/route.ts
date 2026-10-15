import { NextResponse } from "next/server";
import { runAllSyncs } from "@/lib/sync";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await runAllSyncs());
}
