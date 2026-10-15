import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getSupplier } from "@/lib/suppliers";
import { retailPrice } from "@/lib/pricing";

export async function GET(req: Request) {
  await requireAdmin();
  const url = new URL(req.url);
  try {
    const results = await getSupplier(url.searchParams.get("supplier") ?? "mock").searchProducts(
      url.searchParams.get("q") ?? "",
      Number(url.searchParams.get("page") ?? 1),
    );
    return NextResponse.json({ results: results.map((r) => ({ ...r, suggestedPriceCents: retailPrice(r.costCents) })) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Search failed" }, { status: 502 });
  }
}
