import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Clock3,
  MapPin,
  Plus,
  Wrench,
} from "lucide-react";

import {
  fetchAllServices,
  type DashboardService,
} from "@/lib/dashboard-data";
import { requireRole } from "@/lib/session";
import {
  ApprovalBadge,
  EmptyState,
  PageHeading,
  formatMoney,
  normalizeStatus,
} from "../../components/dashboard-ui";

function SummaryCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
          {label}
        </p>
        <span
          className={`flex size-10 items-center justify-center rounded-lg ${tone}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-[26px] leading-none font-bold text-slate-900">
        {value}
      </p>
    </article>
  );
}

async function ServicesContent() {
  const session = await requireRole("technician");

  let services: DashboardService[] = [];

  try {
    services = await fetchAllServices();
  } catch (error) {
    console.error("Could not load technician services:", error);

    return (
      <p
        role="alert"
        className="rounded-xl border border-rose-200 bg-white p-5 text-sm text-rose-700"
      >
        Your services are temporarily unavailable. Please try again later.
      </p>
    );
  }

  const myServices = services
    .filter((service) => service.technicianId === session.user.id)
    .sort(
      (first, second) =>
        new Date(second.createdAt ?? 0).getTime() -
        new Date(first.createdAt ?? 0).getTime()
    );

  if (myServices.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={<Wrench className="size-5" aria-hidden="true" />}
          title="No services yet"
          description="Add your first repair service. An admin reviews it, then customers can book it from the catalogue."
        />
        <div className="text-center">
          <Link
            href="/technician/services/new"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-blue-600 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add your first service
          </Link>
        </div>
      </div>
    );
  }

  const approvedServices = myServices.filter(
    (service) => normalizeStatus(service.approvalStatus) === "approved"
  );
  const pendingServices = myServices.filter(
    (service) => normalizeStatus(service.approvalStatus) !== "approved"
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="My services"
          value={myServices.length}
          icon={<Wrench className="size-5" aria-hidden="true" />}
          tone="bg-blue-50 text-blue-600"
        />
        <SummaryCard
          label="Approved"
          value={approvedServices.length}
          icon={<BadgeCheck className="size-5" aria-hidden="true" />}
          tone="bg-emerald-50 text-emerald-600"
        />
        <SummaryCard
          label="Awaiting review"
          value={pendingServices.length}
          icon={<Clock3 className="size-5" aria-hidden="true" />}
          tone="bg-amber-50 text-amber-500"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {myServices.map((service) => {
          const approved =
            normalizeStatus(service.approvalStatus) === "approved";
          const hidden = service.isActive === false;

          return (
            <article
              key={service._id}
              className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <div className="relative aspect-[1.6] bg-slate-100">
                {service.image || service.thumbnail ? (
                  <Image
                    src={service.image || service.thumbnail || ""}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="grid size-full place-items-center text-slate-400">
                    <Wrench className="size-7" aria-hidden="true" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="min-w-0 text-[15px] leading-snug font-semibold text-slate-900">
                    {service.title}
                  </h2>
                  <ApprovalBadge status={service.approvalStatus} />
                </div>

                <p className="mt-1.5 text-[12.5px] text-slate-500">
                  {service.category ?? "Service"} ·{" "}
                  {formatMoney(service.basePrice || service.price)}
                </p>

                {service.serviceArea || service.location ? (
                  <p className="mt-2 flex items-center gap-1.5 text-[12px] text-slate-500">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    {service.serviceArea || service.location}
                  </p>
                ) : null}

                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                  <span
                    className={
                      hidden
                        ? "text-[12px] font-medium text-amber-600"
                        : "text-[12px] font-medium text-emerald-600"
                    }
                  >
                    {hidden ? "Hidden from catalogue" : "Visible in catalogue"}
                  </span>

                  <div className="flex items-center gap-3">
                    {approved ? (
                      <Link
                        href={`/services/${service._id}`}
                        className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-500 hover:text-blue-600"
                      >
                        Public page
                        <ArrowUpRight
                          className="size-3.5"
                          aria-hidden="true"
                        />
                      </Link>
                    ) : (
                      <span className="text-[12px] text-slate-400">
                        Needs approval
                      </span>
                    )}

                    <Link
                      href={`/technician/services/${service._id}`}
                      className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Details
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function ServicesSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading services">
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-xl bg-white" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-72 animate-pulse rounded-xl bg-white" />
        ))}
      </div>
    </div>
  );
}

export default function TechnicianServicesPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="My services"
        description="Everything you have listed, its approval state and whether it is visible in the catalogue."
      >
        <div className="mt-4">
          <Link
            href="/technician/services/new"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-blue-600 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add service
          </Link>
        </div>
      </PageHeading>
      <Suspense fallback={<ServicesSkeleton />}>
        <ServicesContent />
      </Suspense>
    </div>
  );
}
