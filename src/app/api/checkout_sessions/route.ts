import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

// Replace the original Stripe sample route, which used price/placeholder IDs.
// The checkout is built from the service stored in the FixMate API instead, so
// the browser can never choose its own price.
type CheckoutBody = {
  serviceId?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  preferredDate?: string;
  notes?: string;
};

type ApiService = {
  _id?: string;
  title?: string;
  category?: string;
  price?: number;
  technicianId?: string;
  isActive?: boolean;
  approvalStatus?: string;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const role = session.user.role ?? "customer";

  if (role !== "customer") {
    return NextResponse.json(
      { error: "Only customer accounts can book a repair." },
      { status: 403 }
    );
  }

  const body = (await request.json()) as CheckoutBody;

  const serviceId = text(body.serviceId);
  const fullName = text(body.fullName) || session.user.name;
  const phone = text(body.phone);
  const address = text(body.address);
  const preferredDate = text(body.preferredDate);
  const notes = text(body.notes).slice(0, 400);

  if (!serviceId || !phone || !address || !preferredDate) {
    return NextResponse.json(
      { error: "Name, phone, address and preferred date are required." },
      { status: 400 }
    );
  }

  const bookingDate = new Date(`${preferredDate}T00:00:00`);

  if (Number.isNaN(bookingDate.getTime())) {
    return NextResponse.json(
      { error: "Choose a valid preferred date." },
      { status: 400 }
    );
  }

  const baseUrl = process.env.BASE_API_URL;

  if (!baseUrl) {
    return NextResponse.json(
      { error: "BASE_API_URL is not configured." },
      { status: 500 }
    );
  }

  let service: ApiService | undefined;

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/services`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Services request failed: ${response.status}`);
    }

    const services: unknown = await response.json();

    if (Array.isArray(services)) {
      service = services.find(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          (item as ApiService)._id === serviceId
      ) as ApiService | undefined;
    }
  } catch (error) {
    console.error("Could not load the service for checkout:", error);

    return NextResponse.json(
      { error: "The service could not be loaded. Please try again." },
      { status: 502 }
    );
  }

  const approved =
    service?.isActive === true &&
    (service.approvalStatus ?? "").toLowerCase() === "approved";

  if (!service || !approved || typeof service.price !== "number") {
    return NextResponse.json(
      { error: "This service is not available for booking." },
      { status: 404 }
    );
  }

  if (service.price <= 0) {
    return NextResponse.json(
      { error: "This service does not have a valid price yet." },
      { status: 400 }
    );
  }

  const origin = new URL(request.url).origin;

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: session.user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "bdt",
            unit_amount: Math.round(service.price * 100),
            product_data: {
              name: service.title ?? "FixMate repair",
              description: service.category ?? "Repair service",
            },
          },
        },
      ],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/services/${service._id}/book`,
      metadata: {
        serviceId: service._id ?? "",
        serviceTitle: service.title ?? "",
        technicianId: service.technicianId ?? "",
        customerId: session.user.id,
        customerName: fullName,
        customerEmail: session.user.email,
        customerPhone: phone,
        customerAddress: address.slice(0, 450),
        preferredDate,
        notes,
      },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("Stripe checkout could not be created:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Stripe could not start the payment.",
      },
      { status: 502 }
    );
  }
}
