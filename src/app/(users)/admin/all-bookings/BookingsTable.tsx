"use client";

import { useState } from "react";

import type { Booking } from "@/lib/dashboard-data";
import {
  PaymentBadge,
  StatusBadge,
  formatDate,
  formatMoney,
  normalizeStatus,
} from "../../components/dashboard-ui";
import FilterTabs from "../../components/FilterTabs";

const filters = [
  { label: "All", value: "all" },
  { label: "Requested", value: "requested" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
  { label: "In Progress", value: "in progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

function serviceName(booking: Booking) {
  return booking.serviceTitle ?? booking.service?.title ?? "Repair service";
}

function customerName(booking: Booking) {
  return booking.customerName ?? booking.customer?.name ?? "—";
}

function technicianName(booking: Booking) {
  return booking.technicianName ?? booking.technician?.name ?? "—";
}

export default function BookingsTable({ bookings }: { bookings: Booking[] }) {
  const [filter, setFilter] = useState("all");

  const visibleBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    return normalizeStatus(booking.status) === filter;
  });

  return (
    <div className="space-y-5">
      <FilterTabs options={filters} value={filter} onChange={setFilter} />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold tracking-[0.06em] text-slate-500 uppercase">
                <th className="px-5 py-3.5 font-semibold">Service</th>
                <th className="px-5 py-3.5 font-semibold">Customer</th>
                <th className="px-5 py-3.5 font-semibold">Technician</th>
                <th className="px-5 py-3.5 font-semibold">Preferred date</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Payment</th>
                <th className="px-5 py-3.5 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleBookings.map((booking) => (
                <tr key={booking._id} className="text-[13.5px] text-slate-600">
                  <td className="px-5 py-5 font-semibold text-slate-900">
                    {serviceName(booking)}
                  </td>
                  <td className="px-5 py-5">{customerName(booking)}</td>
                  <td className="px-5 py-5">{technicianName(booking)}</td>
                  <td className="px-5 py-5">
                    {formatDate(booking.preferredDate)}
                  </td>
                  <td className="px-5 py-5">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-5 py-5">
                    <PaymentBadge status={booking.paymentStatus} />
                  </td>
                  <td className="px-5 py-5 font-semibold text-slate-900">
                    {formatMoney(booking.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visibleBookings.length === 0 ? (
          <p className="px-6 py-12 text-center text-[13px] text-slate-500">
            {bookings.length === 0
              ? "No bookings have been requested yet."
              : "No bookings match this filter."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
