import { NextResponse } from "next/server";

import { apiFetch, errorMessage } from "@/lib/api";
import { auth } from "@/lib/auth";
import {
  bookingBelongsToCustomer,
  bookingBelongsToTechnician,
  normalizeBookingStatus,
  TECHNICIAN_TRANSITIONS,
} from "@/lib/booking-rules";
import type { Booking } from "@/lib/types";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

// Updates a booking status. Ownership and the allowed transitions are checked
// here, on the server, so the browser cannot skip a step by calling the API.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Invalid booking." }, { status: 400 });
  }

  let body: { status?: string; finalAmount?: number | string };

  try {
    body = (await request.json()) as { status?: string; finalAmount?: number | string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const nextStatus = normalizeBookingStatus(text(body.status));

  if (!nextStatus) {
    return NextResponse.json({ error: "Choose a status." }, { status: 400 });
  }

  try {
    const bookingResult = await apiFetch(`/bookings/${encodeURIComponent(id)}`);

    if (!bookingResult.ok) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: bookingResult.status }
      );
    }

    const booking = bookingResult.data as Booking;
    const currentStatus = normalizeBookingStatus(booking.status);
    const role = session.user.role ?? "customer";

    if (role === "admin") {
      return NextResponse.json(
        { error: "Admins can monitor bookings but cannot change their status." },
        { status: 403 }
      );
    }

    if (role === "customer") {
      if (!bookingBelongsToCustomer(booking, session.user)) {
        return NextResponse.json(
          { error: "You can only update your own booking." },
          { status: 403 }
        );
      }

      if (nextStatus !== "cancelled" || currentStatus !== "requested") {
        return NextResponse.json(
          { error: "You can only cancel a request while it is still requested." },
          { status: 409 }
        );
      }
    }

    if (role === "technician") {
      if (!bookingBelongsToTechnician(booking, session.user)) {
        return NextResponse.json(
          { error: "You can only update bookings assigned to you." },
          { status: 403 }
        );
      }

      const allowed = TECHNICIAN_TRANSITIONS[currentStatus] ?? [];

      if (!allowed.includes(nextStatus)) {
        return NextResponse.json(
          { error: `A ${currentStatus} booking cannot become ${nextStatus}.` },
          { status: 409 }
        );
      }

      if (nextStatus === "completed") {
        const finalAmount = Number(body.finalAmount);

        if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
          return NextResponse.json(
            { error: "Enter a final amount greater than zero." },
            { status: 400 }
          );
        }
      }
    }

    const updateResult = await apiFetch(`/bookings/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: nextStatus,
        ...(nextStatus === "completed"
          ? { finalAmount: Number(body.finalAmount) }
          : {}),
      }),
    });

    if (!updateResult.ok) {
      return NextResponse.json(
        { error: errorMessage(updateResult.data, "Could not update the booking.") },
        { status: updateResult.status }
      );
    }

    return NextResponse.json(updateResult.data);
  } catch (error) {
    console.error("Could not update the booking:", error);
    return NextResponse.json(
      { error: "Could not update the booking. Please try again." },
      { status: 502 }
    );
  }
}
