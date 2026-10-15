const ITEMS = [
  { t: "Free worldwide shipping", d: "Tracked to your door, 7 to 15 business days", icon: <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /> },
  { t: "30-day returns", d: "Not right for your pet? Send it back", icon: <path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4" /> },
  { t: "Secure checkout", d: "Cards, Apple Pay and Google Pay", icon: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></> },
  { t: "Real human support", d: "Email us, a person replies", icon: <path d="M4 5h16v11H8l-4 4V5z" /> },
];

export function TrustBar({ className = "" }: { className?: string }) {
  return (
    <section aria-label="Our promises" className={`border-y border-line ${className}`}>
      <div className="container-x grid grid-cols-2 gap-y-8 py-10 lg:grid-cols-4">
        {ITEMS.map((i) => (
          <div key={i.t} className="flex gap-4 pr-4">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="mt-0.5 shrink-0 text-moss" aria-hidden>
              {i.icon}
            </svg>
            <div>
              <p className="text-sm font-semibold">{i.t}</p>
              <p className="mt-1 text-[13px] leading-snug text-ink/60">{i.d}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
