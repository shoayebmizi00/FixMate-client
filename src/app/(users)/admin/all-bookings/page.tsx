import { Suspense } from "react";

import { fetchAllBookings, type Booking } from "@/lib/dashboard-data";
import { requireRole } from "@/lib/session";
import { PageHeading } from "../../components/dashboard-ui";
import BookingsTable from "./BookingsTable";

async function BookingsContent() {
  await requireRole("admin");

  let bookings: Booking[] = [];

  try {
    bookings = await fetchAllBookings();
  } catch (error) {
    console.error("Could not load bookings:", error);

    return (
      <p
        role="alert"
        className="rounded-xl border border-rose-200 bg-white p-5 text-sm text-rose-700"
      >
        Bookings are temporarily unavailable. Please try again later.
      </p>
    );
  }

  return <BookingsTable bookings={bookings} />;
}

function BookingsSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Loading bookings">
      <div className="h-9 w-96 animate-pulse rounded-full bg-slate-200" />
      <div className="h-80 animate-pulse rounded-xl bg-white" />
    </div>
  );
}

export default function AllBookingsPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="All bookings"
        description="A read-only view of every repair requested through FixMate."
      />
      <Suspense fallback={<BookingsSkeleton />}>
        <BookingsContent />
      </Suspense>
    </div>
  );
}
