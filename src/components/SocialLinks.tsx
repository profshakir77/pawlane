import { SOCIALS } from "@/lib/business";

const ICONS: Record<string, JSX.Element> = {
  Facebook: <path d="M14 8.5V6.8c0-.8.5-1.3 1.3-1.3H17V2.6h-2.4C12 2.6 11 4.2 11 6.5v2H8.6v3H11V21h3v-9.5h2.6l.4-3H14z" fill="currentColor" stroke="none" />,
  Instagram: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" /></>,
  Pinterest: <path d="M12 3a9 9 0 00-3.3 17.4c0-.8 0-1.9.2-2.7l1.3-5.4s-.3-.7-.3-1.6c0-1.5.9-2.7 2-2.7.9 0 1.4.7 1.4 1.5 0 .9-.6 2.3-.9 3.6-.3 1.1.5 2 1.6 2 1.9 0 3.2-2.4 3.2-5.3 0-2.2-1.5-3.8-4.1-3.8-3 0-4.9 2.2-4.9 4.7 0 .9.3 1.5.7 2 .2.2.2.3.1.6l-.2.8c-.1.3-.3.4-.6.3-1.5-.6-2.2-2.3-2.2-4.1 0-3 2.6-6.7 7.7-6.7 4.1 0 6.8 3 6.8 6.2 0 4.2-2.3 7.4-5.8 7.4-1.2 0-2.3-.6-2.6-1.4l-.7 2.8c-.3 1-.8 2-1.3 2.8A9 9 0 1012 3z" fill="currentColor" stroke="none" />,
  TikTok: <path d="M16.5 3c.3 2 1.6 3.5 3.5 3.7v3a7 7 0 01-3.5-1.1v6.2a5.8 5.8 0 11-5.8-5.8c.3 0 .6 0 .9.1v3.1a2.8 2.8 0 102 2.6V3h2.9z" fill="currentColor" stroke="none" />,
};

export function SocialLinks({ className = "" }: { className?: string }) {
  if (SOCIALS.length === 0) return null;
  return (
    <ul className={`flex items-center gap-3 ${className}`}>
      {SOCIALS.map((s) => (
        <li key={s.name}>
          <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`Wrenpaw on ${s.name}`}
            className="grid h-10 w-10 place-items-center rounded-full border border-current opacity-70 transition hover:scale-105 hover:opacity-100">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">{ICONS[s.name]}</svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
