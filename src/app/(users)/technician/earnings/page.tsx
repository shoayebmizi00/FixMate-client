import { Suspense } from "react";
import type { ReactNode } from "react";
import {
  BadgeCheck,
  CircleDollarSign,
  Clock3,
  Wallet,
} from "lucide-react";

import { fetchAllBookings, type Booking } from "@/lib/dashboard-data";
import { requireRole } from "@/lib/session";
import {
  EmptyState,
  PageHeading,
  PaymentBadge,
  formatDate,
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

function serviceName(booking: Booking) {
  return booking.serviceTitle ?? booking.service?.title ?? "Repair service";
}

function customerName(booking: Booking) {
  return booking.customerName ?? booking.customer?.name ?? "Customer";
}

function isPaid(booking: Booking) {
  return normalizeStatus(booking.paymentStatus) === "paid";
}

async function EarningsContent() {
  const session = await requireRole("technician");

  let bookings: Booking[] = [];

  try {
    bookings = await fetchAllBookings();
  } catch (error) {
    console.error("Could not load technician earnings:", error);

    return (
      <p
        role="alert"
        className="rounded-xl border border-rose-200 bg-white p-5 text-sm text-rose-700"
      >
        Your earnings are temporarily unavailable. Please try again later.
      </p>
    );
  }

  const myBookings = bookings
    .filter((booking) => booking.technicianId === session.user.id)
    .sort(
      (first, second) =>
        new Date(second.createdAt ?? 0).getTime() -
        new Date(first.createdAt ?? 0).getTime()
    );

  if (myBookings.length === 0) {
    return (
      <EmptyState
        icon={<Wallet className="size-5" aria-hidden="true" />}
        title="No earnings yet"
        description="When a customer pays for one of your completed jobs, the amount will appear here."
      />
    );
  }

  const paidBookings = myBookings.filter(isPaid);
  const totalEarned = paidBookings.reduce(
    (total, booking) => total + (booking.amount ?? 0),
    0
  );

  // A finished job that the customer has not paid for yet.
  const awaitingPayment = myBookings.filter(
    (booking) =>
      normalizeStatus(booking.status) === "completed" && !isPaid(booking)
  );
  const awaitingAmount = awaitingPayment.reduce(
    (total, booking) => total + (booking.amount ?? 0),
    0
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total earned"
          value={formatMoney(totalEarned)}
          icon={<CircleDollarSign className="size-5" aria-hidden="true" />}
          tone="bg-emerald-50 text-emerald-600"
        />
        <SummaryCard
          label="Paid jobs"
          value={paidBookings.length}
          icon={<BadgeCheck className="size-5" aria-hidden="true" />}
          tone="bg-blue-50 text-blue-600"
        />
        <SummaryCard
          label="Awaiting payment"
          value={formatMoney(awaitingAmount)}
          icon={<Clock3 className="size-5" aria-hidden="true" />}
          tone="bg-amber-50 text-amber-500"
        />
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-[15px] font-semibold text-slate-900">
            Payment history
          </h2>
          <p className="mt-1 text-[12.5px] text-slate-500">
            Completed jobs show whether the customer has paid.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold tracking-[0.06em] text-slate-500 uppercase">
                <th className="px-5 py-3.5 font-semibold">Service</th>
                <th className="px-5 py-3.5 font-semibold">Customer</th>
                <th className="px-5 py-3.5 font-semibold">Job date</th>
                <th className="px-5 py-3.5 font-semibold">Payment</th>
                <th className="px-5 py-3.5 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myBookings.map((booking) => (
                <tr
                  key={booking._id}
                  className="text-[13.5px] text-slate-600"
                >
                  <td className="px-5 py-5 font-semibold text-slate-900">
                    {serviceName(booking)}
                  </td>
                  <td className="px-5 py-5">{customerName(booking)}</td>
                  <td className="px-5 py-5">
                    {formatDate(booking.preferredDate ?? booking.createdAt)}
                  </td>
                  <td className="px-5 py-5">
                    <PaymentBadge status={booking.paymentStatus} />
                  </td>
                  <td className="px-5 py-5 text-right font-semibold text-slate-900">
                    {formatMoney(booking.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function EarningsSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading earnings">
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-xl bg-white" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl bg-white" />
    </div>
  );
}

export default function TechnicianEarningsPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Earnings"
        description="What you have earned from completed repairs and what is still waiting to be paid."
      />
      <Suspense fallback={<EarningsSkeleton />}>
        <EarningsContent />
      </Suspense>
    </div>
  );
}
