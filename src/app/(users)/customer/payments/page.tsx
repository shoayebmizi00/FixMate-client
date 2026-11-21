import { Suspense, type ReactNode } from "react";
import { CalendarClock, CircleDollarSign, ReceiptText } from "lucide-react";

import { fetchAllPayments, type Payment } from "@/lib/dashboard-data";
import { requireRole } from "@/lib/session";
import {
  EmptyState,
  PageHeading,
  PaymentBadge,
  formatDate,
  formatMoney,
} from "../../components/dashboard-ui";

function SummaryCard({ label, value, icon, tone }: {
  label: string;
  value: string | number;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-[0.08em] text-slate-500 uppercase">{label}</p>
        <span className={`flex size-10 items-center justify-center rounded-lg ${tone}`}>{icon}</span>
      </div>
      <p className="mt-3 text-[26px] leading-none font-bold text-slate-900">{value}</p>
    </article>
  );
}

async function PaymentsContent() {
  const session = await requireRole("customer");
  let payments: Payment[];

  try {
    payments = await fetchAllPayments();
  } catch (error) {
    console.error("Could not load customer payments:", error);
    return (
      <p role="alert" className="rounded-xl border border-rose-200 bg-white p-5 text-sm text-rose-700">
        Your payments are temporarily unavailable. Please try again later.
      </p>
    );
  }

  const myPayments = payments
    .filter((payment) =>
      payment.customerId === session.user.id ||
      payment.customerEmail?.toLowerCase() === session.user.email.toLowerCase()
    )
    .sort((first, second) =>
      new Date(second.paidAt ?? second.createdAt ?? 0).getTime() -
      new Date(first.paidAt ?? first.createdAt ?? 0).getTime()
    );

  if (myPayments.length === 0) {
    return (
      <EmptyState
        icon={<ReceiptText className="size-5" aria-hidden="true" />}
        title="No payments yet"
        description="Once you complete a repair payment, the receipt appears here."
      />
    );
  }

  const totalPaid = myPayments.reduce((total, payment) => total + payment.amount, 0);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Total paid" value={formatMoney(totalPaid)} icon={<CircleDollarSign className="size-5" />} tone="bg-emerald-50 text-emerald-600" />
        <SummaryCard label="Payments" value={myPayments.length} icon={<ReceiptText className="size-5" />} tone="bg-blue-50 text-blue-600" />
        <SummaryCard label="Last payment" value={formatDate(myPayments[0]?.paidAt ?? myPayments[0]?.createdAt)} icon={<CalendarClock className="size-5" />} tone="bg-indigo-50 text-indigo-500" />
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold tracking-[0.06em] text-slate-500 uppercase">
                <th className="px-5 py-3.5">Transaction ID</th>
                <th className="px-5 py-3.5">Service</th>
                <th className="px-5 py-3.5">Technician</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myPayments.map((payment) => (
                <tr key={payment._id} className="text-[13.5px] text-slate-600">
                  <td className="px-5 py-5 font-mono text-[12.5px] font-medium text-slate-900">
                    {payment.transactionId ?? payment.stripeSessionId ?? payment._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-5 py-5">{payment.serviceTitle ?? "Repair service"}</td>
                  <td className="px-5 py-5">{payment.technicianName ?? "—"}</td>
                  <td className="px-5 py-5">{formatDate(payment.paidAt ?? payment.createdAt)}</td>
                  <td className="px-5 py-5"><PaymentBadge status={payment.paymentStatus} /></td>
                  <td className="px-5 py-5 text-right font-semibold text-slate-900">{formatMoney(payment.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function CustomerPaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeading title="Payments" description="Every repair payment you have made." />
      <Suspense fallback={<div className="h-72 animate-pulse rounded-xl bg-white" />}>
        <PaymentsContent />
      </Suspense>
    </div>
  );
}
