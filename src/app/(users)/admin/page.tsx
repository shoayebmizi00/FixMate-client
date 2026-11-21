import { Suspense } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  CircleDollarSign,
  ClipboardList,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import {
  fetchAllBookings,
  fetchAllServices,
  fetchAllPayments,
  fetchAllUsers,
  type Booking,
  type DashboardService,
  type DashboardUser,
  type Payment,
} from "@/lib/dashboard-data";
import { requireRole } from "@/lib/session";
import {
  PageHeading,
  StatusBadge,
  formatDate,
  formatMoney,
  normalizeStatus,
} from "../components/dashboard-ui";

const statusOrder = [
  "requested",
  "accepted",
  "in progress",
  "completed",
  "rejected",
  "cancelled",
];

function bookingTitle(booking: Booking) {
  return booking.serviceTitle ?? booking.service?.title ?? "Repair service";
}

function bookingCustomer(booking: Booking) {
  return booking.customerName ?? booking.customer?.name ?? "Customer";
}

function bookingDate(booking: Booking) {
  return booking.preferredDate ?? booking.createdAt;
}

function StatCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
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
      <p className="mt-3 text-[30px] leading-none font-bold text-slate-900">{value}</p>
      <p className="mt-3 min-h-4 text-[12px] text-slate-500">{hint}</p>
    </article>
  );
}

function BookingsChart({ bookings }: { bookings: Booking[] }) {
  const counts = statusOrder.map(
    (status) =>
      bookings.filter((booking) => normalizeStatus(booking.status) === status).length
  );
  const max = Math.max(4, ...counts);
  const labels = [0, 1, 2, 3, 4].map((step) => Math.round((max * (4 - step)) / 4));

  return (
    <div className="mt-6 flex gap-4">
      <div className="flex h-[160px] w-5 flex-col justify-between text-right text-[11px] text-slate-400">
        {labels.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div className="relative h-[160px]">
          <div aria-hidden="true" className="absolute inset-0">
            {[0, 1, 2, 3, 4].map((line) => (
              <div
                key={line}
                className="absolute inset-x-0 border-t border-dashed border-slate-200"
                style={{ top: `${line * 25}%` }}
              />
            ))}
          </div>

          <div className="relative flex h-full items-end gap-2 sm:gap-4">
            {statusOrder.map((status, index) => (
              <div key={status} className="flex flex-1 justify-center">
                <div
                  className="w-10 rounded-t-md bg-blue-600 sm:w-12"
                  style={{
                    height: `${Math.max((counts[index] / max) * 100, 2)}%`,
                  }}
                  title={`${status}: ${counts[index]}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex gap-2 sm:gap-4">
          {statusOrder.map((status) => (
            <span
              key={status}
              className="flex-1 text-center text-[10.5px] text-slate-500 sm:text-[11px]"
            >
              {status}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading overview">
      <div className="h-16 w-80 animate-pulse rounded bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-36 animate-pulse rounded-xl bg-white" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <div className="h-80 animate-pulse rounded-xl bg-white" />
        <div className="h-80 animate-pulse rounded-xl bg-white" />
      </div>
    </div>
  );
}

async function AdminOverview() {
  await requireRole("admin");

  let users: DashboardUser[] = [];
  let services: DashboardService[] = [];
  let bookings: Booking[] = [];
  let transactions: Payment[] = [];

  try {
    [users, services, bookings, transactions] = await Promise.all([
      fetchAllUsers(),
      fetchAllServices(),
      fetchAllBookings(),
      fetchAllPayments(),
    ]);
  } catch (error) {
    console.error("Could not load the admin overview:", error);

    return (
      <p
        role="alert"
        className="rounded-xl border border-rose-200 bg-white p-5 text-sm text-rose-700"
      >
        Dashboard data is temporarily unavailable. Please try again later.
      </p>
    );
  }

  const technicians = users.filter(
    (user) => normalizeStatus(user.role) === "technician"
  ).length;
  const awaitingApproval = services.filter(
    (service) => normalizeStatus(service.approvalStatus) !== "approved"
  ).length;
  const verifiedRevenue = transactions
    .filter((transaction) => normalizeStatus(transaction.paymentStatus) === "paid")
    .reduce((total, transaction) => total + (transaction.amount ?? 0), 0);

  const latestBookings = [...bookings]
    .sort(
      (first, second) =>
        new Date(second.createdAt ?? 0).getTime() -
        new Date(first.createdAt ?? 0).getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeading
        title="Platform overview"
        description="Users, listings, bookings and verified revenue across FixMate."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total users"
          value={users.length}
          hint={`${technicians} ${technicians === 1 ? "technician" : "technicians"}`}
          icon={<Users className="size-5" aria-hidden="true" />}
          tone="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Services"
          value={services.length}
          hint={`${awaitingApproval} awaiting approval`}
          icon={<BadgeCheck className="size-5" aria-hidden="true" />}
          tone="bg-amber-50 text-amber-500"
        />
        <StatCard
          label="Bookings"
          value={bookings.length}
          icon={<ClipboardList className="size-5" aria-hidden="true" />}
          tone="bg-indigo-50 text-indigo-500"
        />
        <StatCard
          label="Verified revenue"
          value={formatMoney(verifiedRevenue)}
          icon={<CircleDollarSign className="size-5" aria-hidden="true" />}
          tone="bg-emerald-50 text-emerald-600"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-[17px] font-semibold text-slate-900">
            Bookings by status
          </h2>
          <BookingsChart bookings={bookings} />
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[17px] font-semibold text-slate-900">
              Latest bookings
            </h2>
            <Link
              href="/admin/all-bookings"
              className="text-[13px] font-medium text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>

          {latestBookings.length === 0 ? (
            <p className="mt-6 text-[13px] text-slate-500">
              No bookings have been requested yet.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {latestBookings.map((booking) => (
                <li key={booking._id} className="py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-slate-900">
                        {bookingTitle(booking)}
                      </p>
                      <p className="mt-1 truncate text-[12px] text-slate-500">
                        {bookingCustomer(booking)} · {formatDate(bookingDate(booking))}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <AdminOverview />
    </Suspense>
  );
}
