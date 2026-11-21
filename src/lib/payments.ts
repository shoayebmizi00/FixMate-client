import "server-only";

import { apiFetch, errorMessage } from "@/lib/api";
import { bookingBelongsToCustomer } from "@/lib/booking-rules";
import { stripe } from "@/lib/stripe";
import type { Booking, Payment } from "@/lib/types";

export type VerifyResult =
  | { status: "unpaid" }
  | { status: "paid"; payment: Payment; booking: Booking };

function paymentIntentId(session: {
  payment_intent?: string | { id: string } | null;
  id: string;
}) {
  if (typeof session.payment_intent === "string") return session.payment_intent;
  if (session.payment_intent && typeof session.payment_intent === "object") {
    return session.payment_intent.id;
  }
  return session.id;
}

export async function createBookingCheckout(
  booking: Booking,
  user: { id: string; email: string },
  origin: string
) {
  if (booking.status !== "completed") {
    throw new Error("Only completed jobs can be paid.");
  }

  if (booking.paymentStatus === "paid") {
    throw new Error("This booking is already paid.");
  }

  if (!bookingBelongsToCustomer(booking, user)) {
    throw new Error("You can only pay for your own booking.");
  }

  const amount = booking.finalAmount ?? booking.basePrice;

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("The final amount has not been set yet.");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "bdt",
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: booking.serviceTitle || "FixMate repair",
            description: `Booking ${booking._id}`,
          },
        },
      },
    ],
    metadata: {
      bookingId: booking._id,
      customerId: user.id,
      customerEmail: user.email,
    },
    success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/payment/cancel?booking_id=${booking._id}`,
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }

  return session.url;
}

// Verifies a Checkout Session, saves the payment once, and marks the booking
// paid. Safe to call from both the success page and the webhook.
export async function verifyCheckoutSession(
  sessionId: string,
  user?: { id: string; email: string },
  jwt?: string | null
): Promise<VerifyResult> {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return { status: "unpaid" };
  }

  const bookingId = session.metadata?.bookingId;

  if (!bookingId) {
    throw new Error("The Stripe session has no booking id.");
  }

  const bookingResult = await apiFetch(`/bookings/${encodeURIComponent(bookingId)}`, {
    headers: {
      ...(jwt
        ? { Authorization: `Bearer ${jwt}` }
        : process.env.INTERNAL_API_SECRET
          ? { "x-fixmate-internal-secret": process.env.INTERNAL_API_SECRET }
          : {}),
    },
  });

  if (!bookingResult.ok) {
    throw new Error("The booking for this payment could not be found.");
  }

  const booking = bookingResult.data as Booking;

  if (user && !bookingBelongsToCustomer(booking, user)) {
    throw new Error("This payment does not belong to your account.");
  }

  const amount = (session.amount_total ?? 0) / 100;

  if (amount <= 0) {
    throw new Error("Stripe did not report a payment amount.");
  }

  const paymentResult = await apiFetch("/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(jwt
        ? { Authorization: `Bearer ${jwt}` }
        : process.env.INTERNAL_API_SECRET
          ? { "x-fixmate-internal-secret": process.env.INTERNAL_API_SECRET }
          : {}),
    },
    body: JSON.stringify({
      bookingId: booking._id,
      serviceTitle: booking.serviceTitle,
      customerId: booking.customerId,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      technicianId: booking.technicianId,
      technicianName: booking.technicianName,
      technicianEmail: booking.technicianEmail,
      amount,
      transactionId: paymentIntentId(session),
      stripeSessionId: session.id,
      paidAt: new Date().toISOString(),
    }),
  });

  if (!paymentResult.ok) {
    throw new Error(
      errorMessage(paymentResult.data, "The payment could not be saved.")
    );
  }

  if (booking.paymentStatus !== "paid") {
    const bookingUpdate = await apiFetch(
      `/bookings/${encodeURIComponent(booking._id)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(jwt
            ? { Authorization: `Bearer ${jwt}` }
            : process.env.INTERNAL_API_SECRET
              ? { "x-fixmate-internal-secret": process.env.INTERNAL_API_SECRET }
              : {}),
        },
        body: JSON.stringify({ paymentStatus: "paid" }),
      }
    );

    if (!bookingUpdate.ok) {
      throw new Error(
        errorMessage(bookingUpdate.data, "The booking could not be marked paid.")
      );
    }
  }

  return {
    status: "paid",
    payment: paymentResult.data as Payment,
    booking,
  };
}
