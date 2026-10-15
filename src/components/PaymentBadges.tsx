// Accepted payment methods. Neutral badges (not the card networks' official
// artwork); swap in the official acceptance marks from your payment provider's
// merchant kit if you prefer.
const METHODS = [
  { name: "Visa", style: "font-black italic tracking-tight text-[#1A1F71]" },
  { name: "Mastercard", style: "font-bold tracking-tight text-[#1F1D1A]", dots: true },
  { name: "Debit", style: "font-semibold text-ink/70" },
];

export function PaymentBadges({ dark = false, className = "" }: { dark?: boolean; className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`} aria-label="Payment methods we accept">
      {METHODS.map((m) => (
        <li key={m.name} className="flex h-8 min-w-[58px] items-center justify-center gap-1 rounded-md border border-line bg-white px-2.5 text-[12px] shadow-sm">
          {m.dots && (
            <span aria-hidden className="relative mr-0.5 inline-block h-3.5 w-5">
              <span className="absolute left-0 top-0 h-3.5 w-3.5 rounded-full bg-[#EB001B]" />
              <span className="absolute left-1.5 top-0 h-3.5 w-3.5 rounded-full bg-[#F79E1B] mix-blend-multiply" />
            </span>
          )}
          <span className={m.style}>{m.name}</span>
        </li>
      ))}
      <li className={`flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[11px] font-medium ${dark ? "border-paper/20 text-paper/80" : "border-line bg-white text-ink/70"}`}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
        Secure SSL checkout
      </li>
    </ul>
  );
}
