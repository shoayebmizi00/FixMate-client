import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { dashboardPathForRole } from "@/lib/dashboard";
import { getCurrentSession } from "@/lib/session";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentSession();

  if (session) {
    redirect(dashboardPathForRole(session.user.role ?? "customer"));
  }

  return children;
}
