import { NextResponse } from "next/server";

import { apiFetch, errorMessage } from "@/lib/api";
import { auth } from "@/lib/auth";
import { SERVICE_CATEGORIES, SERVICE_MODES } from "@/lib/categories";
import { getBetterAuthJwt } from "@/lib/server-jwt";

type ServiceBody = {
  title?: string;
  category?: string;
  description?: string;
  basePrice?: number | string;
  estimatedDuration?: string;
  serviceMode?: string;
  serviceArea?: string;
  image?: string;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function makeSlug(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  const suffix = Date.now().toString(36).slice(-5);
  return `${base || "service"}-${suffix}`;
}

function isHttpUrl(value: string) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// A technician creates a service from the dashboard. Ownership always comes
// from the session, never from the browser.
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  if (session.user.role !== "technician") {
    return NextResponse.json(
      { error: "Only technicians can add services." },
      { status: 403 }
    );
  }

  const body = (await request.json()) as ServiceBody;
  const title = text(body.title).slice(0, 120);
  const category = text(body.category);
  const description = text(body.description).slice(0, 2000);
  const serviceMode = text(body.serviceMode);
  const estimatedDuration = text(body.estimatedDuration) || "1-2 hours";
  const serviceArea =
    text(body.serviceArea) || session.user.area || "Dhaka, Bangladesh";
  const rawImage = text(body.image);
  const image = isHttpUrl(rawImage) ? rawImage : "";
  const basePrice =
    typeof body.basePrice === "number" ? body.basePrice : Number(body.basePrice ?? 0);

  if (title === "") {
    return NextResponse.json({ error: "A service title is required." }, { status: 400 });
  }

  if (description === "") {
    return NextResponse.json(
      { error: "A short description is required." },
      { status: 400 }
    );
  }

  if (!Number.isFinite(basePrice) || basePrice <= 0) {
    return NextResponse.json(
      { error: "Enter a price greater than zero." },
      { status: 400 }
    );
  }

  if (!SERVICE_CATEGORIES.includes(category as (typeof SERVICE_CATEGORIES)[number])) {
    return NextResponse.json(
      { error: "Choose a valid category." },
      { status: 400 }
    );
  }

  if (!SERVICE_MODES.includes(serviceMode as (typeof SERVICE_MODES)[number])) {
    return NextResponse.json(
      { error: "Choose Home Visit or Shop Drop-off." },
      { status: 400 }
    );
  }

  try {
    const jwt = await getBetterAuthJwt(request.headers);
    const result = await apiFetch("/services", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
      body: JSON.stringify({
        title,
        slug: makeSlug(title),
        description,
        category,
        basePrice: Math.round(basePrice * 100) / 100,
        estimatedDuration,
        serviceMode,
        serviceArea,
        image,
        technicianId: session.user.id,
        technicianName: session.user.name,
        technicianEmail: session.user.email,
      }),
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: errorMessage(result.data, "Could not add the service.") },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("Could not add the service:", error);
    return NextResponse.json(
      { error: "Could not add the service. Please try again." },
      { status: 502 }
    );
  }
}
