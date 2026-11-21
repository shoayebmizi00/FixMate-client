import { NextResponse } from "next/server";

import { apiFetch, errorMessage } from "@/lib/api";
import { auth } from "@/lib/auth";
import { getBetterAuthJwt } from "@/lib/server-jwt";

export async function GET() {
  try {
    const result = await apiFetch("/settings");

    if (!result.ok) {
      return NextResponse.json(
        { error: errorMessage(result.data, "Could not load settings.") },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Could not load settings:", error);
    return NextResponse.json(
      { error: "Could not load settings." },
      { status: 502 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Only admins can change settings." },
      { status: 403 }
    );
  }

  let body: { categories?: string[]; modes?: string[] };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const jwt = await getBetterAuthJwt(request.headers);
    const result = await apiFetch("/settings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: errorMessage(result.data, "Could not save settings.") },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Could not save settings:", error);
    return NextResponse.json(
      { error: "Could not save settings." },
      { status: 502 }
    );
  }
}
