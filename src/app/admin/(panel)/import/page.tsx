"use client";
import { useState } from "react";
import { formatUsd } from "@/lib/currency";

type R = { supplierProductId: string; title: string; image?: string; costCents: number; suggestedPriceCents: number };

export default function ImportPage() {
  const [supplier, setSupplier] = useState("cj");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<R[]>([]);
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState<Record<string, string>>({});

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Searching...");
    const res = await fetch(`/api/admin/supplier/search?supplier=${supplier}&q=${encodeURIComponent(q)}`);
    const json = await res.json();
    if (!res.ok) { setMsg(json.error); setResults([]); return; }
    setResults(json.results);
    setMsg(json.results.length ? "" : "No products match. Try a broader word, like \"dog bed\".");
  }

  async function importOne(id: string) {
    setDone((d) => ({ ...d, [id]: "Importing..." }));
    const res = await fetch("/api/admin/products", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplier, supplierProductId: id }),
    });
    const json = await res.json();
    setDone((d) => ({ ...d, [id]: res.ok ? "Imported" : json.error }));
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-extrabold">Find products</h1>
      <p className="mt-2 text-sm text-ink/60">Look for items where the suggested price still looks fair next to Amazon. If it does not, skip it.</p>
      <form onSubmit={search} className="mt-6 flex flex-wrap gap-3">
        <label className="sr-only" htmlFor="sup">Supplier</label>
        <select id="sup" value={supplier} onChange={(e) => setSupplier(e.target.value)} className="input w-auto">
          <option value="cj">CJ Dropshipping</option>
          <option value="mock">Demo supplier</option>
        </select>
        <label className="sr-only" htmlFor="q">Search</label>
        <input id="q" value={q} onChange={(e) => setQ(e.target.value)} className="input flex-1" placeholder="e.g. cat water fountain" />
        <button className="btn-primary">Search</button>
      </form>
      {msg && <p className="mt-4" role="status">{msg}</p>}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((r) => (
          <div key={r.supplierProductId} className="rounded-3xl border border-ink/10 p-4">
            {r.image && <img src={r.image} alt="" className="aspect-square w-full rounded-2xl object-cover" />}
            <p className="mt-3 line-clamp-2 font-semibold">{r.title}</p>
            <p className="mt-1 text-sm">Cost {formatUsd(r.costCents)} . sells for {formatUsd(r.suggestedPriceCents)}</p>
            <button onClick={() => importOne(r.supplierProductId)} disabled={!!done[r.supplierProductId]} className="btn-primary mt-3 w-full py-2 text-sm">
              {done[r.supplierProductId] ?? "Add to store"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
