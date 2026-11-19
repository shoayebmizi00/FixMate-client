import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

// Only admins may change another user's role.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Only admins can change roles." }, { status: 403 });
  }

  const baseUrl = process.env.BASE_API_URL;

  if (!baseUrl) {
    return NextResponse.json({ error: "BASE_API_URL is not configured." }, { status: 500 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const response = await fetch(
      `${baseUrl.replace(/\/$/, "")}/users/${id}`,
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
    console.error("Could not update the user:", error);
    return NextResponse.json({ error: "Could not update the user." }, { status: 502 });
  }
}
