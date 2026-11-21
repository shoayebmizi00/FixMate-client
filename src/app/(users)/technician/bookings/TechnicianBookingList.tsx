"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Check,
  Loader2,
  Play,
  X,
  type LucideIcon,
} from "lucide-react";

import { toast } from "@/components/ui/toast";
import type { Booking } from "@/lib/dashboard-data";
import FilterTabs from "../../components/FilterTabs";
import {
  PaymentBadge,
  StatusBadge,
  formatDate,
  formatMoney,
  normalizeStatus,
} from "../../components/dashboard-ui";

const filters = [
  { label: "All", value: "all" },
  { label: "Requested", value: "requested" },
  { label: "Accepted", value: "accepted" },
  { label: "In progress", value: "in progress" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

type BookingAction = {
  label: string;
  status: string;
  message: string;
  icon: LucideIcon;
  variant: "primary" | "danger";
};

// Each status shows only the actions that make sense for it.
function actionsForStatus(status: string): BookingAction[] {
  if (status === "requested") {
    return [
      {
        label: "Accept",
        status: "accepted",
        message: "The customer can see that you accepted the job.",
        icon: Check,
        variant: "primary",
      },
      {
        label: "Decline",
        status: "rejected",
        message: "The job was declined.",
        icon: X,
        variant: "danger",
      },
    ];
  }

  if (status === "accepted") {
    return [
      {
        label: "Start work",
        status: "in progress",
        message: "The job is now marked as in progress.",
        icon: Play,
        variant: "primary",
      },
    ];
  }

  if (status === "in progress") {
    return [
      {
        label: "Mark complete",
        status: "completed",
        message: "The customer can now pay for the finished repair.",
        icon: BadgeCheck,
        variant: "primary",
      },
    ];
  }

  return [];
}

function serviceName(booking: Booking) {
  return booking.serviceTitle ?? booking.service?.title ?? "Repair service";
}

function customerName(booking: Booking) {
  return booking.customerName ?? booking.customer?.name ?? "Customer";
}

function customerEmail(booking: Booking) {
  return booking.customerEmail ?? booking.customer?.email ?? "";
}

export default function TechnicianBookingList({
  bookings,
}: {
  bookings: Booking[];
}) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("all");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [completionId, setCompletionId] = useState<string | null>(null);
  const [finalAmount, setFinalAmount] = useState("");
  const [rejectId, setRejectId] = useState<string | null>(null);

  const sortedBookings = [...bookings].sort(
    (first, second) =>
      new Date(second.createdAt ?? 0).getTime() -
      new Date(first.createdAt ?? 0).getTime()
  );

  const visibleBookings =
    activeFilter === "all"
      ? sortedBookings
      : sortedBookings.filter(
          (booking) => normalizeStatus(booking.status) === activeFilter
        );

  async function updateStatus(booking: Booking, action: BookingAction) {
    setSavingId(booking._id);

    try {
      const response = await fetch(`/api/bookings/${booking._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action.status,
          ...(action.status === "completed"
            ? { finalAmount: Number(finalAmount) }
            : {}),
        }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not update this booking.");
      }

      toast.add({
        title: "Booking updated",
        description: action.message,
        type: "success",
      });
      router.refresh();
      setCompletionId(null);
      setRejectId(null);
      setFinalAmount("");
    } catch (error) {
      toast.add({
        title: "Update failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        type: "error",
      });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterTabs
          options={filters}
          value={activeFilter}
          onChange={setActiveFilter}
        />
        <p className="text-[12.5px] text-slate-500">
          Showing {visibleBookings.length} of {sortedBookings.length} bookings
        </p>
      </div>

      {visibleBookings.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-[13px] text-slate-500">
          No bookings match the status you selected.
        </p>
      ) : (
        <div className="space-y-4">
          {visibleBookings.map((booking) => {
            const actions = actionsForStatus(normalizeStatus(booking.status));
            const isSaving = savingId === booking._id;
            const email = customerEmail(booking);

            return (
              <article
                key={booking._id}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-[15px] font-semibold text-slate-900">
                      {serviceName(booking)}
                    </h2>
                    <p className="mt-1 text-[12.5px] text-slate-500">
                      {customerName(booking)}
                      {email ? ` · ${email}` : ""}
                    </p>
                    {booking.customerPhone ? (
                      <p className="mt-1 text-[12.5px] text-slate-500">
                        Phone: {booking.customerPhone}
                      </p>
                    ) : null}
                    {booking.address ? (
                      <p className="mt-1 text-[12.5px] text-slate-500">
                        Address: {booking.address}
                      </p>
                    ) : null}
                    {booking.problemDescription ? (
                      <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-slate-600">
                        Problem: {booking.problemDescription}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[12px] text-slate-400">
                      Requested {formatDate(booking.createdAt)} · Preferred{" "}
                      {formatDate(booking.preferredDate)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={booking.status} />
                    <PaymentBadge status={booking.paymentStatus} />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <p className="text-[14px] font-semibold text-slate-900">
                    {formatMoney(booking.amount)}
                  </p>

                  {actions.length === 0 ? (
                    <p className="text-[12px] text-slate-400">
                      No action needed right now.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {actions.map((action) => {
                        const Icon = action.icon;

                        return (
                          <button
                            key={action.status}
                            type="button"
                            onClick={() => {
                              if (action.status === "completed") {
                                setCompletionId(booking._id);
                                setFinalAmount(
                                  String(
                                    booking.finalAmount && booking.finalAmount > 0
                                      ? booking.finalAmount
                                      : booking.basePrice
                                  )
                                );
                              } else if (action.status === "rejected") {
                                setRejectId(booking._id);
                              } else {
                                void updateStatus(booking, action);
                              }
                            }}
                            disabled={isSaving}
                            className={
                              action.variant === "danger"
                                ? "inline-flex h-9 items-center gap-1.5 rounded-full border border-rose-200 bg-white px-4 text-[12.5px] font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-60"
                                : "inline-flex h-9 items-center gap-1.5 rounded-full bg-blue-600 px-4 text-[12.5px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                            }
                          >
                            {isSaving ? (
                              <Loader2
                                className="size-4 animate-spin"
                                aria-hidden="true"
                              />
                            ) : (
                              <Icon className="size-4" aria-hidden="true" />
                            )}
                            {action.label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {completionId ? (
                    (() => {
                      const booking = bookings.find((item) => item._id === completionId);
                      if (!booking) return null;
                      const action = actionsForStatus("in progress")[0];

                      return (
                        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-labelledby="complete-title">
                          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                            <h2 id="complete-title" className="text-lg font-semibold text-slate-900">Set the final repair amount</h2>
                            <p className="mt-2 text-sm text-slate-500">
                              The customer will pay this amount after you mark the job completed.
                            </p>
                            <label htmlFor="final-amount" className="mt-5 block text-sm font-medium text-slate-800">
                              Final amount (USD)
                            </label>
                            <input
                              id="final-amount"
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={finalAmount}
                              onChange={(event) => setFinalAmount(event.target.value)}
                              className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3.5 text-sm outline-none focus:border-blue-400"
                            />
                            <div className="mt-6 flex justify-end gap-3">
                              <button type="button" onClick={() => setCompletionId(null)} className="h-10 rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-700">
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={Number(finalAmount) <= 0 || savingId === completionId}
                                onClick={() => void updateStatus(booking, action)}
                                className="h-10 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white disabled:opacity-60"
                              >
                                {savingId === completionId ? "Saving…" : "Mark completed"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : null}

                  {rejectId ? (
                    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-labelledby="reject-title">
                      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                        <h2 id="reject-title" className="text-lg font-semibold text-slate-900">Reject this repair request?</h2>
                        <p className="mt-2 text-sm leading-relaxed text-slate-500">The customer will see that the request was rejected.</p>
                        <div className="mt-6 flex justify-end gap-3">
                          <button type="button" onClick={() => setRejectId(null)} className="h-10 rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-700">Keep request</button>
                          <button
                            type="button"
                            disabled={savingId === rejectId}
                            onClick={() => {
                              const booking = bookings.find((item) => item._id === rejectId);
                              if (booking) {
                                const action = actionsForStatus("requested").find((item) => item.status === "rejected");
                                if (action) void updateStatus(booking, action);
                              }
                            }}
                            className="h-10 rounded-full bg-rose-600 px-5 text-sm font-semibold text-white disabled:opacity-60"
                          >
                            {savingId === rejectId ? "Saving…" : "Reject request"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
