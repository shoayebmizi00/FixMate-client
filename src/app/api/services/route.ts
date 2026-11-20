import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

// A technician creates a service from the dashboard. The technician id always
// comes from the signed-in session, never from the browser, so a service can
// not be assigned to somebody else.
type ServiceBody = {
  title?: string;
  category?: string;
  description?: string;
  price?: number | string;
  location?: string;
  serviceMode?: string;
  estimatedDuration?: string;
  thumbnail?: string;
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

  // A short suffix keeps two services with the same title apart.
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

  const baseUrl = process.env.BASE_API_URL;

  if (!baseUrl) {
    return NextResponse.json(
      { error: "BASE_API_URL is not configured." },
      { status: 500 }
    );
  }

  const body = (await request.json()) as ServiceBody;

  const title = text(body.title).slice(0, 120);
  const category = text(body.category) || "General";
  const description = text(body.description).slice(0, 2000);
  const location = text(body.location).slice(0, 120);
  const serviceMode = text(body.serviceMode) || "On-site";
  const estimatedDuration = text(body.estimatedDuration) || "1-2 hours";
  const rawThumbnail = text(body.thumbnail);
  const thumbnail = isHttpUrl(rawThumbnail) ? rawThumbnail : "";
  const price =
    typeof body.price === "number" ? body.price : Number(body.price ?? 0);

  if (title === "") {
    return NextResponse.json(
      { error: "A service title is required." },
      { status: 400 }
    );
  }

  if (description === "") {
    return NextResponse.json(
      { error: "A short description is required." },
      { status: 400 }
    );
  }

  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json(
      { error: "Enter a price greater than zero." },
      { status: 400 }
    );
  }

  // New listings always start as pending, so an admin reviews them before
  // they reach the public catalogue.
  const service = {
    title,
    slug: makeSlug(title),
    description,
    category,
    price: Math.round(price * 100) / 100,
    estimatedDuration,
    thumbnail,
    isActive: true,
    approvalStatus: "pending",
    technicianId: session.user.id,
    technicianName: session.user.name,
    serviceMode,
    serviceType: serviceMode,
    mode: serviceMode,
    location,
    createdAt: new Date().toISOString(),
  };

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(service),
      cache: "no-store",
    });

    const data: unknown = await response.json().catch(() => ({}));

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Could not create the service:", error);

    return NextResponse.json(
      { error: "Could not create the service." },
      { status: 502 }
    );
  }
}
