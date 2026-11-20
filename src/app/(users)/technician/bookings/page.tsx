import { Suspense } from "react";
import { ClipboardList } from "lucide-react";

import { fetchAllBookings, type Booking } from "@/lib/dashboard-data";
import { requireRole } from "@/lib/session";
import { EmptyState, PageHeading } from "../../components/dashboard-ui";
import TechnicianBookingList from "./TechnicianBookingList";

async function BookingsContent() {
  const session = await requireRole("technician");

  let bookings: Booking[] = [];

  try {
    bookings = await fetchAllBookings();
  } catch (error) {
    console.error("Could not load technician bookings:", error);

    return (
      <p
        role="alert"
        className="rounded-xl border border-rose-200 bg-white p-5 text-sm text-rose-700"
      >
        Your bookings are temporarily unavailable. Please try again later.
      </p>
    );
  }

  const myBookings = bookings.filter(
    (booking) => booking.technicianId === session.user.id
  );

  if (myBookings.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList className="size-5" aria-hidden="true" />}
        title="No jobs assigned yet"
        description="When a customer books one of your approved services, the request will appear here."
      />
    );
  }

  return <TechnicianBookingList bookings={myBookings} />;
}

function BookingsSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading bookings">
      <div className="h-9 w-80 animate-pulse rounded-full bg-slate-200" />
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-36 animate-pulse rounded-xl bg-white" />
      ))}
    </div>
  );
}

export default function TechnicianBookingsPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Assigned bookings"
        description="Accept new requests, keep each job's status up to date and mark work complete."
      />
      <Suspense fallback={<BookingsSkeleton />}>
        <BookingsContent />
      </Suspense>
    </div>
  );
}
