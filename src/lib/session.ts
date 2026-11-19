import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { dashboardPathForRole } from "@/lib/dashboard";

// Reads the signed-in user from the better-auth session cookie.
export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}

// Use this inside a page to protect it. Example: await requireRole("admin").
export async function requireRole(...allowedRoles: string[]) {
  const session = await requireSession();

  const role = session.user.role ?? "customer";

  if (!allowedRoles.includes(role)) {
    redirect(dashboardPathForRole(role));
  }

  return session;
}

// Use this when any signed-in account may open the page.
export async function requireSession() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/signin");
  }

  return session;
}
