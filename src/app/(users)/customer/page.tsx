import { Suspense } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { Activity, CheckCircle2, ClipboardList } from "lucide-react";

import { fetchAllBookings, type Booking } from "@/lib/dashboard-data";
import { requireRole } from "@/lib/session";
import { EmptyState, PageHeading, normalizeStatus } from "../components/dashboard-ui";
import CustomerBookings from "./CustomerBookings";

function StatCard({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold tracking-[0.08em] text-slate-500 uppercase">{label}</p>
        {icon}
      </div>
      <p className="mt-3 text-[28px] font-bold text-slate-900">{value}</p>
    </article>
  );
}

async function CustomerContent() {
  const session = await requireRole("customer");

  let bookings: Booking[] = [];

  try {
    bookings = await fetchAllBookings();
  } catch (error) {
    console.error("Could not load customer bookings:", error);

    return (
      <p
        role="alert"
        className="rounded-xl border border-rose-200 bg-white p-5 text-sm text-rose-700"
      >
        Your bookings are temporarily unavailable. Please try again later.
      </p>
    );
  }

  const myBookings = bookings.filter(
    (booking) =>
      booking.customerId === session.user.id ||
      booking.customerEmail === session.user.email
  );
  const activeStatuses = ["requested", "accepted", "in-progress", "in progress"];
  const activeJobs = myBookings.filter((booking) =>
    activeStatuses.includes(normalizeStatus(booking.status))
  ).length;
  const completedJobs = myBookings.filter(
    (booking) => normalizeStatus(booking.status) === "completed"
  ).length;

  const overview = (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard label="Total requests" value={myBookings.length} icon={<ClipboardList className="size-5 text-blue-600" />} />
      <StatCard label="Active jobs" value={activeJobs} icon={<Activity className="size-5 text-amber-600" />} />
      <StatCard label="Completed jobs" value={completedJobs} icon={<CheckCircle2 className="size-5 text-emerald-600" />} />
    </div>
  );

  if (myBookings.length === 0) {
    return (
      <div className="space-y-4">
        {overview}
        <EmptyState
          icon={<ClipboardList className="size-5" aria-hidden="true" />}
          title="No bookings yet"
          description="Book a repair from the catalogue and it will appear here with its status and payment."
        />
        <Link
          href="/services"
          className="inline-flex h-10 items-center rounded-full bg-blue-600 px-5 text-[13px] font-semibold text-white hover:bg-blue-700"
        >
          Browse services
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {overview}
      <CustomerBookings
        bookings={myBookings}
        customer={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        }}
      />
    </div>
  );
}

function CustomerSkeleton() {
  return (
    <div className="h-64 animate-pulse rounded-xl bg-white" role="status" aria-label="Loading bookings" />
  );
}

export default function CustomerPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="My bookings"
        description="Track the repairs you requested and pay for the work once it is done."
      />
      <Suspense fallback={<CustomerSkeleton />}>
        <CustomerContent />
      </Suspense>
    </div>
  );
}
