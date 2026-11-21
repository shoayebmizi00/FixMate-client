import { Suspense } from "react";

import { fetchAllServices, type DashboardService } from "@/lib/dashboard-data";
import { requireRole } from "@/lib/session";
import { PageHeading } from "../../components/dashboard-ui";
import AllServicesList from "./AllServicesList";

async function AllServicesContent() {
  await requireRole("admin");

  let services: DashboardService[] = [];

  try {
    services = await fetchAllServices();
  } catch (error) {
    console.error("Could not load all services:", error);
    return (
      <p role="alert" className="rounded-xl border border-rose-200 bg-white p-5 text-sm text-rose-700">
        Services are temporarily unavailable. Please try again later.
      </p>
    );
  }

  const sortedServices = [...services].sort(
    (first, second) =>
      new Date(second.createdAt ?? 0).getTime() -
      new Date(first.createdAt ?? 0).getTime()
  );

  return <AllServicesList services={sortedServices} />;
}

export default function AllServicesPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="All services"
        description="View every service and delete a listing when it should no longer appear."
      />
      <Suspense fallback={<div className="h-72 animate-pulse rounded-xl bg-white" />}>
        <AllServicesContent />
      </Suspense>
    </div>
  );
}
