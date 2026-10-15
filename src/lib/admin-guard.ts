import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "./auth";

// Defense in depth: middleware already protects /admin, but server actions
// and API routes check again.
export async function requireAdmin() {
  const session = await verifySession(cookies().get(SESSION_COOKIE)?.value);
  if (!session) throw new Error("Not signed in");
  return session;
}
