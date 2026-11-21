import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { verifyCheckoutSession } from "@/lib/payments";

// The success page and the webhook both use the same verification helper.
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id")?.trim() ?? "";

  if (!sessionId) {
    return NextResponse.json(
      { error: "A Stripe session id is required." },
      { status: 400 }
    );
  }

  try {
    const result = await verifyCheckoutSession(sessionId, {
      id: session.user.id,
      email: session.user.email,
    });

    if (result.status === "unpaid") {
      return NextResponse.json({ status: "unpaid" });
    }

    return NextResponse.json({
      status: "paid",
      payment: result.payment,
      bookingId: result.booking._id,
    });
  } catch (error) {
    console.error("Could not verify the payment:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not verify the payment.",
      },
      { status: 400 }
    );
  }
}
