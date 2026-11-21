import { NextResponse } from "next/server";

import { apiFetch, errorMessage } from "@/lib/api";
import { auth } from "@/lib/auth";
import { isActiveStatus } from "@/lib/booking-rules";
import type { Booking, Service } from "@/lib/types";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

// Creates a repair request. The customer pays only after the technician marks
// the job completed, so a new booking always starts requested + unpaid.
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const role = session.user.role ?? "customer";

  if (role !== "customer") {
    return NextResponse.json(
      { error: "Only customers can request a repair." },
      { status: 403 }
    );
  }

  const body = (await request.json()) as {
    serviceId?: string;
    phone?: string;
    address?: string;
    preferredDate?: string;
    problemDescription?: string;
  };

  const serviceId = text(body.serviceId);
  const phone = text(body.phone);
  const address = text(body.address);
  const preferredDate = text(body.preferredDate);
  const problemDescription = text(body.problemDescription);

  if (!serviceId || !phone || !address || !preferredDate) {
    return NextResponse.json(
      { error: "Phone, address and preferred date are required." },
      { status: 400 }
    );
  }

  if (problemDescription.length < 20) {
    return NextResponse.json(
      { error: "Describe the problem in at least 20 characters." },
      { status: 400 }
    );
  }

  if (preferredDate < today()) {
    return NextResponse.json(
      { error: "Choose today or a future date." },
      { status: 400 }
    );
  }

  try {
    const serviceResult = await apiFetch(
      `/services/${encodeURIComponent(serviceId)}`
    );

    if (!serviceResult.ok) {
      return NextResponse.json(
        { error: "This service is not available." },
        { status: 404 }
      );
    }

    const service = serviceResult.data as Service;

    if (!service.isAvailable || service.approvalStatus !== "approved") {
      return NextResponse.json(
        { error: "This service is not available." },
        { status: 404 }
      );
    }

    if (
      (service.technicianId && service.technicianId === session.user.id) ||
      service.technicianEmail?.toLowerCase() === session.user.email.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "Technicians cannot request their own repair service." },
        { status: 403 }
      );
    }

    // One active request per customer per service.
    const existingResult = await apiFetch(
      `/bookings?customerEmail=${encodeURIComponent(session.user.email)}`
    );
    const existing = Array.isArray(existingResult.data)
      ? (existingResult.data as Booking[])
      : [];

    const duplicate = existing.some(
      (booking) =>
        booking.serviceId === serviceId && isActiveStatus(booking.status)
    );

    if (duplicate) {
      return NextResponse.json(
        { error: "You already have an active request for this service." },
        { status: 409 }
      );
    }

    const createResult = await apiFetch("/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId: service._id,
        serviceTitle: service.title,
        serviceImage: service.image ?? "",
        category: service.category,
        basePrice: service.basePrice,
        technicianId: service.technicianId ?? "",
        technicianName: service.technicianName ?? "",
        technicianEmail: service.technicianEmail ?? "",
        customerId: session.user.id,
        customerName: session.user.name,
        customerEmail: session.user.email,
        customerPhone: phone,
        address,
        preferredDate,
        problemDescription,
      }),
    });

    if (!createResult.ok) {
      return NextResponse.json(
        { error: errorMessage(createResult.data, "Could not create the request.") },
        { status: createResult.status }
      );
    }

    return NextResponse.json(createResult.data, { status: 201 });
  } catch (error) {
    console.error("Could not create the booking:", error);
    return NextResponse.json(
      { error: "Could not create the request. Please try again." },
      { status: 502 }
    );
  }
}
