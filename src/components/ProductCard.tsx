import Link from "next/link";
import { Price } from "./ShopProvider";

type P = { slug: string; title: string; image?: string; image2?: string; fromCents: number; compareAtCents?: number | null; category: string; stock?: number };

export function ProductCard({ p }: { p: P }) {
  const save = p.compareAtCents && p.compareAtCents > p.fromCents ? Math.round((1 - p.fromCents / p.compareAtCents) * 100) : 0;
  const low = p.stock !== undefined && p.stock > 0 && p.stock < 15;
  const soldOut = p.stock !== undefined && p.stock <= 0;

  return (
    <Link href={`/products/${p.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-meadow">
        {p.image && (
          <img src={p.image} alt={p.title} loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04] ${p.image2 ? "group-hover:opacity-0" : ""}`} />
        )}
        {p.image2 && (
          <img src={p.image2} alt="" aria-hidden loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-100" />
        )}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {soldOut ? (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-caps text-ink/70">Sold out</span>
          ) : save >= 10 ? (
            <span className="rounded-full bg-clay px-2.5 py-1 text-[10px] font-semibold uppercase tracking-caps text-paper">Save {save}%</span>
          ) : null}
          {low && <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-caps text-ink">Low stock</span>}
        </div>
        <span className="absolute inset-x-3 bottom-3 translate-y-2 rounded-full bg-paper/95 py-2.5 text-center text-xs font-medium tracking-wide opacity-0 shadow-soft transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View product
        </span>
      </div>
      <p className="eyebrow mt-4">{p.category}</p>
      <h3 className="mt-1.5 font-display text-lg leading-snug transition-colors group-hover:text-moss">{p.title}</h3>
      <p className="mt-1.5 flex items-baseline gap-2 text-sm">
        <Price cents={p.fromCents} className="font-medium" />
        {save > 0 ? <Price cents={p.compareAtCents!} className="text-ink/40 line-through" /> : null}
      </p>
    </Link>
  );
}

// Shared mapper so every grid passes the same fields.
export function toCard(p: { slug: string; title: string; images: string[]; category: string; variants: { priceCents: number; compareAtCents: number | null; stock: number }[] }): P {
  return {
    slug: p.slug, title: p.title, image: p.images[0], image2: p.images[1], category: p.category,
    fromCents: p.variants[0]?.priceCents ?? 0, compareAtCents: p.variants[0]?.compareAtCents,
    stock: p.variants.reduce((s, v) => s + v.stock, 0),
  };
}
