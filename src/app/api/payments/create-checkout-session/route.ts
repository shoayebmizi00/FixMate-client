import { NextResponse } from "next/server";

import { apiFetch } from "@/lib/api";
import { auth } from "@/lib/auth";
import { createBookingCheckout } from "@/lib/payments";
import type { Booking } from "@/lib/types";
import { getBetterAuthJwt } from "@/lib/server-jwt";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

// Starts Stripe Checkout for a completed, unpaid booking. The amount always
// comes from the stored booking, never from the browser.
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  if ((session.user.role ?? "customer") !== "customer") {
    return NextResponse.json(
      { error: "Only customers can pay for a booking." },
      { status: 403 }
    );
  }

  let body: { bookingId?: string };

  try {
    body = (await request.json()) as { bookingId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const bookingId = text(body.bookingId);

  if (!bookingId) {
    return NextResponse.json({ error: "Choose a booking to pay." }, { status: 400 });
  }

  try {
    const jwt = await getBetterAuthJwt(request.headers);
    const bookingResult = await apiFetch(`/bookings/${encodeURIComponent(bookingId)}`, {
      headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
    });

    if (!bookingResult.ok) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    const booking = bookingResult.data as Booking;
    const origin =
      process.env.BETTER_AUTH_URL || new URL(request.url).origin;

    const url = await createBookingCheckout(
      booking,
      { id: session.user.id, email: session.user.email },
      origin
    );

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Could not start checkout:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not start the payment. Please try again.",
      },
      { status: 400 }
    );
  }
}
