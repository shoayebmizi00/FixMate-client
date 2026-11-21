import { NextResponse } from "next/server";

import { apiFetch, errorMessage } from "@/lib/api";
import { auth } from "@/lib/auth";

const ROLES = ["customer", "technician", "admin"];

// Only admins may change another user's role, and nobody may change their own.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Only admins can change roles." },
      { status: 403 }
    );
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Invalid user." }, { status: 400 });
  }

  if (id === session.user.id) {
    return NextResponse.json(
      { error: "You cannot change your own role." },
      { status: 403 }
    );
  }

  let body: { role?: string };

  try {
    body = (await request.json()) as { role?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const role = body.role;

  if (!role || !ROLES.includes(role)) {
    return NextResponse.json({ error: "Choose a valid role." }, { status: 400 });
  }

  try {
    const result = await apiFetch(`/users/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: errorMessage(result.data, "Could not update the user.") },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Could not update the user:", error);
    return NextResponse.json(
      { error: "Could not update the user. Please try again." },
      { status: 502 }
    );
  }
}
