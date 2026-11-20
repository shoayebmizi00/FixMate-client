"use client";

import { useState } from "react";
import { ClipboardList } from "lucide-react";

import type { Booking } from "@/lib/dashboard-data";
import FilterTabs from "../../components/FilterTabs";
import { EmptyState, normalizeStatus } from "../../components/dashboard-ui";
import CustomerBookings from "../CustomerBookings";

type CustomerInfo = {
  id: string;
  name: string;
  email: string;
};

// These are the same labels the rest of the dashboard uses.
const filters = [
  { label: "All", value: "all" },
  { label: "Requested", value: "requested" },
  { label: "Accepted", value: "accepted" },
  { label: "In progress", value: "in progress" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

export default function CustomerBookingList({
  bookings,
  customer,
}: {
  bookings: Booking[];
  customer: CustomerInfo;
}) {
  const [activeFilter, setActiveFilter] = useState("all");

  // Newest bookings first, so the most recent request is easy to find.
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
        <EmptyState
          icon={<ClipboardList className="size-5" aria-hidden="true" />}
          title="Nothing in this list"
          description="No bookings currently match the status you selected. Try another filter."
        />
      ) : (
        <CustomerBookings bookings={visibleBookings} customer={customer} />
      )}
    </div>
  );
}
