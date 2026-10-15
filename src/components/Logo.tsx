// Wrenpaw mark: a small wren perched on a paw print. Original artwork, kept in
// sync with src/app/icon.svg (the favicon).
export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="32" cy="32" r="31" fill="#4A5D4F"/><ellipse cx="32" cy="47" rx="11" ry="8" fill="#FBF9F5"/><ellipse cx="17" cy="38.5" rx="4" ry="5" fill="#FBF9F5" transform="rotate(-18 17 38.5)"/><ellipse cx="47" cy="38.5" rx="4" ry="5" fill="#FBF9F5" transform="rotate(18 47 38.5)"/><path d="M23.5 25 14 12.5l3.6-1L27 22z" fill="#B98E57"/><ellipse cx="31" cy="27" rx="10.5" ry="7.5" fill="#B98E57" transform="rotate(-12 31 27)"/><circle cx="40.5" cy="20.5" r="6" fill="#B98E57"/><path d="M46 19.2 51.5 21 46 22.6z" fill="#B98E57"/><circle cx="42" cy="19.5" r="1.4" fill="#1F1D1A"/><path d="M25 26.5c3 2.6 7.5 3 11 .8" stroke="#8C6A3F" strokeWidth="1.6" fill="none" strokeLinecap="round"/><path d="M30 34v4.5M34 33.5V38" stroke="#B98E57" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

export function Logo({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={34} />
      <span className="font-display text-2xl tracking-tight sm:text-[28px]">{name}</span>
    </span>
  );
}
