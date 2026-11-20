import { Suspense } from "react";
import type { ReactNode } from "react";
import {
  CalendarClock,
  CircleDollarSign,
  ReceiptText,
} from "lucide-react";

import {
  fetchAllBookings,
  fetchAllTransactions,
  type Booking,
  type Transaction,
} from "@/lib/dashboard-data";
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

function transactionReference(transaction: Transaction) {
  return transaction.reference ?? transaction._id.slice(-8).toUpperCase();
}

function serviceTitle(booking: Booking) {
  return booking.serviceTitle ?? booking.service?.title ?? "Repair service";
}

async function PaymentsContent() {
  const session = await requireRole("customer");

  let transactions: Transaction[] = [];
  let bookings: Booking[] = [];

  try {
    [transactions, bookings] = await Promise.all([
      fetchAllTransactions(),
      fetchAllBookings(),
    ]);
  } catch (error) {
    console.error("Could not load customer payments:", error);

    return (
      <p
        role="alert"
        className="rounded-xl border border-rose-200 bg-white p-5 text-sm text-rose-700"
      >
        Your payments are temporarily unavailable. Please try again later.
      </p>
    );
  }

  // Only show payments that belong to the signed-in customer.
  const myTransactions = transactions
    .filter((transaction) => transaction.customerId === session.user.id)
    .sort(
      (first, second) =>
        new Date(second.createdAt ?? 0).getTime() -
        new Date(first.createdAt ?? 0).getTime()
    );

  const myBookings = bookings.filter(
    (booking) =>
      booking.customerId === session.user.id ||
      booking.customerEmail === session.user.email
  );

  // A small lookup so the table can show the service name instead of an id.
  const bookingTitles: Record<string, string> = {};

  for (const booking of myBookings) {
    bookingTitles[booking._id] = serviceTitle(booking);
  }

  if (myTransactions.length === 0) {
    return (
      <EmptyState
        icon={<ReceiptText className="size-5" aria-hidden="true" />}
        title="No payments yet"
        description="Once you pay for a repair, the receipt and its reference will appear here."
      />
    );
  }

  const verifiedTransactions = myTransactions.filter(
    (transaction) => normalizeStatus(transaction.status) === "verified"
  );
  const totalPaid = verifiedTransactions.reduce(
    (total, transaction) => total + (transaction.amount ?? 0),
    0
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total paid"
          value={formatMoney(totalPaid)}
          icon={<CircleDollarSign className="size-5" aria-hidden="true" />}
          tone="bg-emerald-50 text-emerald-600"
        />
        <SummaryCard
          label="Payments"
          value={myTransactions.length}
          icon={<ReceiptText className="size-5" aria-hidden="true" />}
          tone="bg-blue-50 text-blue-600"
        />
        <SummaryCard
          label="Last payment"
          value={formatDate(myTransactions[0]?.createdAt)}
          icon={<CalendarClock className="size-5" aria-hidden="true" />}
          tone="bg-indigo-50 text-indigo-500"
        />
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold tracking-[0.06em] text-slate-500 uppercase">
                <th className="px-5 py-3.5 font-semibold">Reference</th>
                <th className="px-5 py-3.5 font-semibold">Service</th>
                <th className="px-5 py-3.5 font-semibold">Method</th>
                <th className="px-5 py-3.5 font-semibold">Date</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myTransactions.map((transaction) => (
                <tr
                  key={transaction._id}
                  className="text-[13.5px] text-slate-600"
                >
                  <td className="px-5 py-5 font-mono text-[12.5px] font-medium text-slate-900">
                    {transactionReference(transaction)}
                  </td>
                  <td className="px-5 py-5">
                    {transaction.bookingId
                      ? bookingTitles[transaction.bookingId] ?? "Repair service"
                      : "Repair service"}
                  </td>
                  <td className="px-5 py-5">{transaction.method ?? "—"}</td>
                  <td className="px-5 py-5">
                    {formatDate(transaction.createdAt)}
                  </td>
                  <td className="px-5 py-5">
                    <PaymentBadge status={transaction.status} />
                  </td>
                  <td className="px-5 py-5 text-right font-semibold text-slate-900">
                    {formatMoney(transaction.amount)}
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

function PaymentsSkeleton() {
  return (
    <div
      className="space-y-4"
      role="status"
      aria-label="Loading payments"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-xl bg-white" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl bg-white" />
    </div>
  );
}

export default function CustomerPaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Payments"
        description="Every repair payment you have made, with its reference and receipt details."
      />
      <Suspense fallback={<PaymentsSkeleton />}>
        <PaymentsContent />
      </Suspense>
    </div>
  );
}
