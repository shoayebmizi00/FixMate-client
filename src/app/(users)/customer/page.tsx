import { Suspense } from "react";
import Link from "next/link";
import { ClipboardList } from "lucide-react";

import { fetchAllBookings, type Booking } from "@/lib/dashboard-data";
import { requireRole } from "@/lib/session";
import { EmptyState, PageHeading } from "../components/dashboard-ui";
import CustomerBookings from "./CustomerBookings";

async function CustomerContent() {
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

  const myBookings = bookings.filter(
    (booking) =>
      booking.customerId === session.user.id ||
      booking.customerEmail === session.user.email
  );

  if (myBookings.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState
          icon={<ClipboardList className="size-5" aria-hidden="true" />}
          title="No bookings yet"
          description="Book a repair from the catalogue and it will appear here with its status and payment."
        />
        <Link
          href="/services"
          className="inline-flex h-10 items-center rounded-full bg-blue-600 px-5 text-[13px] font-semibold text-white hover:bg-blue-700"
        >
          Browse services
        </Link>
      </div>
    );
  }

  return (
    <CustomerBookings
      bookings={myBookings}
      customer={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      }}
    />
  );
}

function CustomerSkeleton() {
  return (
    <div className="h-64 animate-pulse rounded-xl bg-white" role="status" aria-label="Loading bookings" />
  );
}

export default function CustomerPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="My bookings"
        description="Track the repairs you requested and pay for the work once it is done."
      />
      <Suspense fallback={<CustomerSkeleton />}>
        <CustomerContent />
      </Suspense>
    </div>
  );
}
