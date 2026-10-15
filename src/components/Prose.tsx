export function Prose({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-5xl leading-tight sm:text-6xl">{title}</h1>
      {updated && <p className="mt-2 text-sm text-ink/60">Last updated {updated}</p>}
      <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-ink/80 [&_a]:underline [&_h2]:pt-4 [&_h2]:text-2xl [&_h2]:font-display [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">{children}</div>
    </article>
  );
}
