"use client";
import { useState } from "react";
import { Price, useShop } from "./ShopProvider";

type V = { id: string; name: string; priceCents: number; compareAtCents: number | null; stock: number; image: string | null };

export function AddToCart({ product, variants }: { product: { title: string; slug: string; image?: string }; variants: V[] }) {
  const { add } = useShop();
  const [vid, setVid] = useState(variants.find((v) => v.stock > 0)?.id ?? variants[0].id);
  const [added, setAdded] = useState(false);
  const v = variants.find((x) => x.id === vid)!;

  return (
    <div className="space-y-5">
      <p className="flex items-baseline gap-3 text-3xl font-bold">
        <Price cents={v.priceCents} />
        {v.compareAtCents ? <Price cents={v.compareAtCents} className="text-lg font-normal text-ink/40 line-through" /> : null}
      </p>
      {variants.length > 1 && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Option</legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((x) => (
              <button key={x.id} type="button" disabled={x.stock <= 0} onClick={() => setVid(x.id)}
                aria-pressed={x.id === vid}
                className={`rounded-full border px-4 py-2 text-sm ${x.id === vid ? "border-ink bg-ink text-paper" : "border-ink/20"} disabled:opacity-40`}>
                {x.name}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <button className="btn-primary w-full sm:w-auto" disabled={v.stock <= 0}
        onClick={() => {
          add({ variantId: v.id, quantity: 1, title: product.title, variantName: v.name, priceCents: v.priceCents, image: v.image ?? product.image, slug: product.slug });
          setAdded(true);
        }}>
        {v.stock <= 0 ? "Sold out" : added ? "Added to cart" : "Add to cart"}
      </button>
      {v.stock > 0 && v.stock < 15 && <p className="text-sm text-moss">Only {v.stock} left</p>}
    </div>
  );
}
