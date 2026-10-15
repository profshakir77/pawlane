export function Prose({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-4xl font-extrabold sm:text-5xl">{title}</h1>
      {updated && <p className="mt-2 text-sm text-ink/60">Last updated {updated}</p>}
      <div className="mt-8 space-y-5 text-lg leading-relaxed [&_a]:underline [&_h2]:pt-4 [&_h2]:text-2xl [&_h2]:font-bold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">{children}</div>
    </article>
  );
}
