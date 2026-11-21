import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { verifyCheckoutSession } from "@/lib/payments";
import { stripe } from "@/lib/stripe";

// Stripe sends the raw JSON body. We verify the signature before touching the
// database, then reuse the same idempotent verification as the success page.
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured." },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error("Invalid Stripe webhook signature:", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status === "paid") {
      try {
        await verifyCheckoutSession(session.id);
      } catch (error) {
        console.error("Could not save the webhook payment:", error);
        // A 500 asks Stripe to retry the event.
        return NextResponse.json(
          { error: "Could not save the payment." },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
