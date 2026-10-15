import Link from "next/link";
import { GUIDES } from "@/content/guides";

export const metadata = {
  title: "Pet buying guides",
  description: "Plain answers to common questions about dog and cat beds, feeders, toys and walking gear.",
  alternates: { canonical: "/guides" },
};

export default function Guides() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="text-5xl">Buying guides</h1>
      <ul className="mt-10 space-y-8">
        {GUIDES.map((g) => (
          <li key={g.slug}>
            <Link href={`/guides/${g.slug}`} className="text-2xl font-bold hover:underline">{g.title}</Link>
            <p className="mt-1 text-ink/70">{g.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
