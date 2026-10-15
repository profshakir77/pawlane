import Link from "next/link";
import { Price } from "./ShopProvider";

type P = { slug: string; title: string; image?: string; fromCents: number; compareAtCents?: number | null; category: string };

export function ProductCard({ p }: { p: P }) {
  return (
    <Link href={`/products/${p.slug}`} className="group block">
      <div className="aspect-square overflow-hidden rounded-[28px] bg-meadow">
        {p.image && <img src={p.image} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />}
      </div>
      <p className="mt-3 text-sm text-moss">{p.category}</p>
      <h3 className="text-lg font-bold leading-snug">{p.title}</h3>
      <p className="mt-1 flex gap-2">
        <Price cents={p.fromCents} className="font-semibold" />
        {p.compareAtCents ? <Price cents={p.compareAtCents} className="text-ink/40 line-through" /> : null}
      </p>
    </Link>
  );
}
