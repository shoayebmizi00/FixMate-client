import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

// Saves a payment record. The customer's name, phone and address are sent by
// the payment form, because a saved customer profile does not exist yet.
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const baseUrl = process.env.BASE_API_URL;

  if (!baseUrl) {
    return NextResponse.json({ error: "BASE_API_URL is not configured." }, { status: 500 });
  }

  const body = await request.json();

  // Build the payment record on the server so the browser stays pure.
  const payment = {
    ...body,
    status: body.status ?? "verified",
    reference: body.reference ?? `FIX-${Date.now()}`,
    createdAt: body.createdAt ?? new Date().toISOString(),
  };

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payment),
      cache: "no-store",
    });

    const data: unknown = await response.json().catch(() => ({}));

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Could not save the transaction:", error);
    return NextResponse.json(
      { error: "Could not save the transaction." },
      { status: 502 }
    );
  }
}
