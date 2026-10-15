"use client";
import { useState } from "react";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [i, setI] = useState(0);
  const list = images.slice(0, 6);
  if (list.length === 0) return <div className="aspect-square rounded-lg bg-meadow" />;

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row">
      {list.length > 1 && (
        <div className="flex gap-3 overflow-x-auto lg:w-20 lg:flex-col" role="tablist" aria-label="Product photos">
          {list.map((src, n) => (
            <button key={src} type="button" role="tab" aria-selected={n === i} aria-label={`Photo ${n + 1}`} onClick={() => setI(n)}
              className={`aspect-square w-16 shrink-0 overflow-hidden rounded-md border transition lg:w-full ${n === i ? "border-ink" : "border-transparent opacity-60 hover:opacity-100"}`}>
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="relative flex-1 overflow-hidden rounded-lg bg-meadow">
        <img src={list[i]} alt={i === 0 ? title : `${title}, photo ${i + 1}`} width={900} height={900}
          className="aspect-square w-full object-cover" />
      </div>
    </div>
  );
}
