export function slugify(text: string, suffix?: string) {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return suffix ? `${base}-${suffix.slice(-6).toLowerCase()}` : base;
}
