import { Suspense } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  BadgeCheck,
  CircleDollarSign,
  ClipboardList,
  Wrench,
} from "lucide-react";

import {
  fetchAllBookings,
  fetchAllServices,
  type Booking,
  type DashboardService,
} from "@/lib/dashboard-data";
import { requireRole } from "@/lib/session";
import {
  ApprovalBadge,
  EmptyState,
  PageHeading,
  StatusBadge,
  formatDate,
  formatMoney,
  normalizeStatus,
} from "../components/dashboard-ui";

function StatCard({
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
        <span className={`flex size-10 items-center justify-center rounded-lg ${tone}`}>
          {icon}
        </span>
      </div>
      <p className="mt-3 text-[28px] leading-none font-bold text-slate-900">
        {value}
      </p>
    </article>
  );
}

function serviceName(booking: Booking) {
  return booking.serviceTitle ?? booking.service?.title ?? "Repair service";
}

async function TechnicianContent() {
  const session = await requireRole("technician");

  let services: DashboardService[] = [];
  let bookings: Booking[] = [];

  try {
    [services, bookings] = await Promise.all([
      fetchAllServices(),
      fetchAllBookings(),
    ]);
  } catch (error) {
    console.error("Could not load technician dashboard:", error);

    return (
      <p
        role="alert"
        className="rounded-xl border border-rose-200 bg-white p-5 text-sm text-rose-700"
      >
        Your dashboard is temporarily unavailable. Please try again later.
      </p>
    );
  }

  const myServices = services.filter(
    (service) => service.technicianId === session.user.id
  );
  const myBookings = bookings.filter(
    (booking) => booking.technicianId === session.user.id
  );
  const pendingServices = myServices.filter(
    (service) => normalizeStatus(service.approvalStatus) !== "approved"
  ).length;
  const paidEarnings = myBookings
    .filter((booking) => normalizeStatus(booking.paymentStatus) === "paid")
    .reduce((total, booking) => total + (booking.amount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="My services"
          value={myServices.length}
          icon={<Wrench className="size-5" aria-hidden="true" />}
          tone="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Awaiting approval"
          value={pendingServices}
          icon={<BadgeCheck className="size-5" aria-hidden="true" />}
          tone="bg-amber-50 text-amber-500"
        />
        <StatCard
          label="Assigned bookings"
          value={myBookings.length}
          icon={<ClipboardList className="size-5" aria-hidden="true" />}
          tone="bg-indigo-50 text-indigo-500"
        />
        <StatCard
          label="Paid earnings"
          value={formatMoney(paidEarnings)}
          icon={<CircleDollarSign className="size-5" aria-hidden="true" />}
          tone="bg-emerald-50 text-emerald-600"
        />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-[17px] font-semibold text-slate-900">
          My published services
        </h2>

        {myServices.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={<Wrench className="size-5" aria-hidden="true" />}
              title="No services published yet"
              description="Services you publish with the technician role will appear here after an admin reviews them."
            />
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {myServices.map((service) => (
              <li key={service._id} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-slate-900">
                      {service.title}
                    </p>
                    <p className="mt-1 text-[12.5px] text-slate-500">
                      {service.category ?? "Service"} ·{" "}
                      {formatMoney(service.price)}
                    </p>
                  </div>
                  <ApprovalBadge status={service.approvalStatus} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-[17px] font-semibold text-slate-900">
          Recent bookings
        </h2>

        {myBookings.length === 0 ? (
          <p className="mt-3 text-[13px] text-slate-500">
            No customers have booked one of your services yet.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {myBookings.slice(0, 6).map((booking) => (
              <li
                key={booking._id}
                className="flex flex-wrap items-center justify-between gap-3 py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-slate-900">
                    {serviceName(booking)}
                  </p>
                  <p className="mt-1 text-[12px] text-slate-500">
                    {formatDate(booking.preferredDate)} ·{" "}
                    {formatMoney(booking.amount)}
                  </p>
                </div>
                <StatusBadge status={booking.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link
        href="/technicians"
        className="inline-flex text-[13px] font-medium text-blue-600 hover:text-blue-700"
      >
        View your public profile
      </Link>
    </div>
  );
}

function TechnicianSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-xl bg-white" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-white" />
    </div>
  );
}

export default function TechnicianPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Technician overview"
        description="Your published services, assigned bookings and paid earnings."
      />
      <Suspense fallback={<TechnicianSkeleton />}>
        <TechnicianContent />
      </Suspense>
    </div>
  );
}
