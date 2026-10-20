import { PrismaClient } from "@prisma/client";

// On Vercel every function instance opens its own database pool. Keep each
// instance to ONE connection so a burst of visitors (or a redeploy) can't
// exhaust the database's connection limit and take the whole store down.
function dbUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw || !raw.startsWith("postgres")) return raw;
  try {
    const u = new URL(raw);
    if (!u.searchParams.has("connection_limit")) u.searchParams.set("connection_limit", "1");
    if (!u.searchParams.has("pool_timeout")) u.searchParams.set("pool_timeout", "20");
    return u.toString();
  } catch {
    return raw;
  }
}

const g = globalThis as unknown as { prisma?: PrismaClient };
const url = dbUrl();
export const prisma = g.prisma ?? new PrismaClient(url ? { datasources: { db: { url } } } : undefined);
g.prisma = prisma;
