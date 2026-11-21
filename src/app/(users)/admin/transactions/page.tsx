import { Suspense } from "react";
import { ReceiptText } from "lucide-react";

import { fetchAllPayments, type Payment } from "@/lib/dashboard-data";
import { requireRole } from "@/lib/session";
import {
  EmptyState,
  PageHeading,
  formatDate,
  formatMoney,
  normalizeStatus,
} from "../../components/dashboard-ui";

function transactionReference(transaction: Payment) {
  return transaction.transactionId ?? transaction.stripeSessionId ?? transaction._id.slice(-8).toUpperCase();
}

async function TransactionsContent() {
  await requireRole("admin");

  let transactions: Payment[] = [];

  try {
    transactions = await fetchAllPayments();
  } catch (error) {
    console.error("Could not load transactions:", error);

    return (
      <p
        role="alert"
        className="rounded-xl border border-rose-200 bg-white p-5 text-sm text-rose-700"
      >
        Transactions are temporarily unavailable. Please try again later.
      </p>
    );
  }

  const verified = transactions.filter(
    (transaction) => normalizeStatus(transaction.paymentStatus) === "paid"
  );
  const revenue = verified.reduce(
    (total, transaction) => total + (transaction.amount ?? 0),
    0
  );

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-[11px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
          Total platform revenue
        </p>
        <p className="mt-2 text-[32px] leading-none font-bold text-slate-900">
          {formatMoney(revenue)}
        </p>
        <p className="mt-3 text-[12.5px] text-slate-500">
          From {verified.length} verified{" "}
          {verified.length === 1 ? "transaction" : "transactions"}
        </p>
      </section>

      {verified.length === 0 ? (
        <EmptyState
          icon={<ReceiptText className="size-5" aria-hidden="true" />}
          title="No transactions yet"
          description="Paid repairs appear here with the customer, technician, amount and transaction reference."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold tracking-[0.06em] text-slate-500 uppercase">
                  <th className="px-5 py-3.5 font-semibold">Reference</th>
                  <th className="px-5 py-3.5 font-semibold">Customer</th>
                  <th className="px-5 py-3.5 font-semibold">Technician</th>
                  <th className="px-5 py-3.5 font-semibold">Method</th>
                  <th className="px-5 py-3.5 font-semibold">Date</th>
                  <th className="px-5 py-3.5 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {verified.map((transaction) => (
                  <tr key={transaction._id} className="text-[13.5px] text-slate-600">
                    <td className="px-5 py-5 font-semibold text-slate-900">
                      {transactionReference(transaction)}
                    </td>
                    <td className="px-5 py-5">
                      {transaction.customerName ?? "—"}
                    </td>
                    <td className="px-5 py-5">
                      {transaction.technicianName ?? "—"}
                    </td>
                    <td className="px-5 py-5 capitalize">
                      Card (Stripe)
                    </td>
                    <td className="px-5 py-5">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-5 py-5 font-semibold text-slate-900">
                      {formatMoney(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function TransactionsSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading transactions">
      <div className="h-32 animate-pulse rounded-xl bg-white" />
      <div className="h-64 animate-pulse rounded-xl bg-white" />
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Transactions"
        description="Only verified payments are recorded here. Revenue is the sum of those records."
      />
      <Suspense fallback={<TransactionsSkeleton />}>
        <TransactionsContent />
      </Suspense>
    </div>
  );
}
