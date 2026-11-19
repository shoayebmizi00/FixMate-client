import { Suspense } from "react";

import {
  fetchAllServices,
  fetchAllUsers,
  type DashboardService,
  type DashboardUser,
} from "@/lib/dashboard-data";
import { requireRole } from "@/lib/session";
import { PageHeading } from "../../components/dashboard-ui";
import ServiceApprovalList from "./ServiceApprovalList";

async function ApprovalContent() {
  await requireRole("admin");

  let services: DashboardService[] = [];
  let users: DashboardUser[] = [];

  try {
    [services, users] = await Promise.all([fetchAllServices(), fetchAllUsers()]);
  } catch (error) {
    console.error("Could not load services for approval:", error);

    return (
      <p
        role="alert"
        className="rounded-xl border border-rose-200 bg-white p-5 text-sm text-rose-700"
      >
        Services are temporarily unavailable. Please try again later.
      </p>
    );
  }

  const technicianNames: Record<string, string> = {};

  for (const user of users) {
    technicianNames[user._id] = user.name;
  }

  return (
    <ServiceApprovalList
      services={services}
      technicianNames={technicianNames}
    />
  );
}

function ApprovalSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Loading services">
      <div className="h-9 w-72 animate-pulse rounded-full bg-slate-200" />
      {[0, 1].map((item) => (
        <div key={item} className="h-28 animate-pulse rounded-xl bg-white" />
      ))}
    </div>
  );
}

export default function ServiceApprovalPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Service approval"
        description="Review technician submissions before they appear in the public catalogue."
      />
      <Suspense fallback={<ApprovalSkeleton />}>
        <ApprovalContent />
      </Suspense>
    </div>
  );
}
