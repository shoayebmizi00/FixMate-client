import { Suspense } from "react";
import { ClipboardList } from "lucide-react";

import { fetchAllBookings, type Booking } from "@/lib/dashboard-data";
import { requireRole } from "@/lib/session";
import { EmptyState, PageHeading } from "../../components/dashboard-ui";
import CustomerBookingList from "./CustomerBookingList";

async function BookingsContent() {
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

  // A booking belongs to this customer when either the id or the email matches.
  const myBookings = bookings.filter(
    (booking) =>
      booking.customerId === session.user.id ||
      booking.customerEmail === session.user.email
  );

  if (myBookings.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList className="size-5" aria-hidden="true" />}
        title="No bookings yet"
        description="Book a repair from the catalogue and it will appear here with its status and payment."
      />
    );
  }

  return (
    <CustomerBookingList
      bookings={myBookings}
      customer={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      }}
    />
  );
}

function BookingsSkeleton() {
  return (
    <div
      className="space-y-4"
      role="status"
      aria-label="Loading bookings"
    >
      <div className="h-9 w-80 animate-pulse rounded-full bg-slate-200" />
      <div className="h-72 animate-pulse rounded-xl bg-white" />
    </div>
  );
}

export default function CustomerBookingsPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="My bookings"
        description="Filter your repair requests, track their progress and pay once the work is done."
      />
      <Suspense fallback={<BookingsSkeleton />}>
        <BookingsContent />
      </Suspense>
    </div>
  );
}
