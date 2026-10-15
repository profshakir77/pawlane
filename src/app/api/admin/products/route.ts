import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { importProduct } from "@/lib/catalog";

const Body = z.object({ supplier: z.string(), supplierProductId: z.string(), category: z.string().optional() });

export async function POST(req: Request) {
  await requireAdmin();
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Missing supplier or product id" }, { status: 400 });
  try {
    const p = await importProduct(parsed.data.supplier, parsed.data.supplierProductId, parsed.data.category);
    return NextResponse.json({ id: p.id, slug: p.slug });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Import failed" }, { status: 502 });
  }
}
