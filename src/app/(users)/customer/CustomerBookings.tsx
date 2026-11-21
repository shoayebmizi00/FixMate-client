"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from "@/components/ui/toast";
import type { Booking } from "@/lib/dashboard-data";
import {
  PaymentBadge,
  StatusBadge,
  formatDate,
  formatMoney,
  normalizeStatus,
} from "../components/dashboard-ui";

type CustomerInfo = {
  id: string;
  name: string;
  email: string;
};

function serviceName(booking: Booking) {
  return booking.serviceTitle ?? "Repair service";
}

function StatusTimeline({ booking }: { booking: Booking }) {
  const status = normalizeStatus(booking.status);
  const terminal = status === "rejected" || status === "cancelled";
  const paid = normalizeStatus(booking.paymentStatus) === "paid";
  const steps = terminal
    ? [status]
    : [
        "requested",
        "accepted",
        "in progress",
        "completed",
        ...(paid ? ["paid"] : []),
      ];
  const currentIndex = terminal ? 0 : paid ? steps.indexOf("paid") : steps.indexOf(status);

  return (
    <div className="mt-2 flex max-w-[360px] flex-wrap items-center gap-1" aria-label="Booking status timeline">
      {steps.map((step, index) => {
        const active = terminal || (paid ? index <= currentIndex : index <= currentIndex);
        return (
          <span
            key={step}
            className={
              active
                ? "rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700"
                : "rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-400"
            }
          >
            {step === "in progress" ? "In progress" : step.charAt(0).toUpperCase() + step.slice(1)}
          </span>
        );
      })}
    </div>
  );
}

export default function CustomerBookings({
  bookings,
}: {
  bookings: Booking[];
  customer: CustomerInfo;
}) {
  const router = useRouter();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);

  async function cancelBooking(bookingId: string) {
    setSavingId(bookingId);

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not cancel the booking.");
      }

      toast.add({
        title: "Booking cancelled",
        description: "The requested repair has been cancelled.",
        type: "success",
      });
      setCancelId(null);
      router.refresh();
    } catch (error) {
      toast.add({
        title: "Could not cancel",
        description: error instanceof Error ? error.message : "Please try again.",
        type: "error",
      });
    } finally {
      setSavingId(null);
    }
  }

  async function payBooking(bookingId: string) {
    setSavingId(bookingId);

    try {
      const response = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Could not start Stripe Checkout.");
      }

      window.location.assign(data.url);
    } catch (error) {
      toast.add({
        title: "Payment could not start",
        description: error instanceof Error ? error.message : "Please try again.",
        type: "error",
      });
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold tracking-[0.06em] text-slate-500 uppercase">
                <th className="px-5 py-3.5">Service</th>
                <th className="px-5 py-3.5">Technician</th>
                <th className="px-5 py-3.5">Preferred date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Payment</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((booking) => {
                const status = normalizeStatus(booking.status);
                const unpaid = normalizeStatus(booking.paymentStatus) !== "paid";
                const canPay = status === "completed" && unpaid;
                const canCancel = status === "requested";
                const amount = booking.finalAmount && booking.finalAmount > 0
                  ? booking.finalAmount
                  : booking.basePrice;

                return (
                  <tr key={booking._id} className="text-[13.5px] text-slate-600">
                    <td className="px-5 py-5 font-semibold text-slate-900">
                      {serviceName(booking)}
                    </td>
                    <td className="px-5 py-5">{booking.technicianName ?? "—"}</td>
                    <td className="px-5 py-5">{formatDate(booking.preferredDate)}</td>
                    <td className="px-5 py-5">
                      <StatusBadge status={booking.status} />
                      <StatusTimeline booking={booking} />
                    </td>
                    <td className="px-5 py-5"><PaymentBadge status={booking.paymentStatus} /></td>
                    <td className="px-5 py-5 font-semibold text-slate-900">
                      {formatMoney(amount)}
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex justify-end gap-2">
                        {canCancel ? (
                          <button
                            type="button"
                            onClick={() => setCancelId(booking._id)}
                            className="h-9 rounded-full border border-rose-200 px-4 text-[12.5px] font-semibold text-rose-600 hover:bg-rose-50"
                          >
                            Cancel
                          </button>
                        ) : null}
                        {canPay ? (
                          <button
                            type="button"
                            onClick={() => payBooking(booking._id)}
                            disabled={savingId === booking._id}
                            className="h-9 rounded-full bg-blue-600 px-4 text-[12.5px] font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                          >
                            {savingId === booking._id ? "Opening…" : "Pay now"}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {cancelId ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-labelledby="cancel-title">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 id="cancel-title" className="text-lg font-semibold text-slate-900">Cancel this repair request?</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              This action cannot be undone. It is only available while the request is still requested.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setCancelId(null)} className="h-10 rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-700">
                Keep request
              </button>
              <button type="button" onClick={() => cancelBooking(cancelId)} disabled={savingId === cancelId} className="h-10 rounded-full bg-rose-600 px-5 text-sm font-semibold text-white disabled:opacity-60">
                {savingId === cancelId ? "Cancelling…" : "Cancel request"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
