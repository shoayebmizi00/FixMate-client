import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

// Signed-in users may update a booking (for example, mark it as paid).
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const baseUrl = process.env.BASE_API_URL;

  if (!baseUrl) {
    return NextResponse.json({ error: "BASE_API_URL is not configured." }, { status: 500 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const response = await fetch(
      `${baseUrl.replace(/\/$/, "")}/bookings/${id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );

    const data: unknown = await response.json().catch(() => ({}));

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Could not update the booking:", error);
    return NextResponse.json({ error: "Could not update the booking." }, { status: 502 });
  }
}
