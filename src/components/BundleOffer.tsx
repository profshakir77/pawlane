"use client";
import Link from "next/link";
import { useState } from "react";
import { Price, useShop } from "./ShopProvider";
import { BUNDLE_PERCENT } from "@/lib/bundles";
import { track } from "@/lib/track";

type Item = { slug: string; title: string; image?: string; variantId: string; variantName: string; priceCents: number };

export function BundleOffer({ name, blurb, items }: { name: string; blurb: string; items: Item[] }) {
  const { add } = useShop();
  const [added, setAdded] = useState(false);
  const total = items.reduce((s, i) => s + i.priceCents, 0);
  const save = Math.round((total * BUNDLE_PERCENT) / 100);

  const onAdd = () => {
    items.forEach((i) => add({ variantId: i.variantId, quantity: 1, title: i.title, variantName: i.variantName, priceCents: i.priceCents, image: i.image, slug: i.slug }));
    track("add_to_cart", { value: (total - save) / 100, items: items.map((i) => ({ id: i.variantId, name: i.title, price: i.priceCents / 100, quantity: 1 })) });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <section className="mt-8 rounded-lg border border-line p-5">
      <p className="eyebrow">Bundle and save {BUNDLE_PERCENT}%</p>
      <h2 className="mt-1.5 font-display text-xl">{name}</h2>
      <p className="mt-1 text-sm text-ink/65">{blurb}</p>
      <ul className="mt-4 space-y-3">
        {items.map((i) => (
          <li key={i.variantId} className="flex items-center gap-3 text-sm">
            {i.image && <img src={i.image} alt="" className="h-12 w-12 rounded-md object-cover" />}
            <Link href={`/products/${i.slug}`} className="flex-1 hover:text-moss">{i.title}</Link>
            <Price cents={i.priceCents} className="text-ink/70" />
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-baseline gap-2 border-t border-line pt-4">
        <Price cents={total - save} className="font-display text-2xl" />
        <Price cents={total} className="text-sm text-ink/40 line-through" />
        <span className="text-xs text-ink/55">for all {items.length}</span>
      </div>
      <button type="button" className="btn-primary mt-4 w-full" onClick={onAdd}>
        {added ? "Bundle added ✓" : `Add all ${items.length} to cart`}
      </button>
      <p className="mt-2 text-center text-xs text-ink/55">The saving is applied automatically in your cart.</p>
    </section>
  );
}
