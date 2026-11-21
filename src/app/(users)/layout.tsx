import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/session";

import DashboardShell from "./components/DashboardShell";

function DashboardSkeleton() {
  return (
    <div
      className="flex min-h-dvh bg-[#f6f9fc]"
      role="status"
      aria-label="Loading dashboard"
    >
      <div className="hidden w-[253px] shrink-0 border-r border-slate-200 bg-white lg:block">
        <div className="h-[72px] border-b border-slate-200" />
        <div className="h-[76px] border-b border-slate-200" />
        <div className="space-y-2 p-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-10 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
      <div className="flex-1">
        <div className="h-[72px] border-b border-slate-200 bg-white" />
        <div className="p-8">
          <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-32 animate-pulse rounded-xl bg-white" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

async function DashboardFrame({ children }: { children: ReactNode }) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <DashboardShell
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        image: session.user.image,
      }}
    >
      {children}
    </DashboardShell>
  );
}

export default function UsersLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardFrame>{children}</DashboardFrame>
    </Suspense>
  );
}
