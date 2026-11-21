import { NextResponse } from "next/server";

import { apiFetch, errorMessage } from "@/lib/api";
import { auth } from "@/lib/auth";
import type { Service } from "@/lib/types";
import { getBetterAuthJwt } from "@/lib/server-jwt";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function number(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function loadService(id: string) {
  const result = await apiFetch(`/services/${encodeURIComponent(id)}`);
  if (!result.ok) return null;
  return result.data as Service;
}

// Technicians may edit their own listing; admins may only approve/reject.
// A technician edit sends the listing back to pending.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Invalid service." }, { status: 400 });
  }

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const jwt = await getBetterAuthJwt(request.headers);
    const service = await loadService(id);

    if (!service) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    const role = session.user.role ?? "customer";
    const ownsService =
      service.technicianId === session.user.id ||
      service.technicianEmail?.toLowerCase() === session.user.email.toLowerCase();

    if (role !== "admin" && !(role === "technician" && ownsService)) {
      return NextResponse.json(
        { error: "You can only edit your own services." },
        { status: 403 }
      );
    }

    const updates: Record<string, unknown> = {};

    if (role === "admin") {
      const approvalStatus = text(body.approvalStatus);

      if (!["pending", "approved", "rejected"].includes(approvalStatus)) {
        return NextResponse.json(
          { error: "Choose approved or rejected." },
          { status: 400 }
        );
      }

      updates.approvalStatus = approvalStatus;
    } else {
      if (body.title !== undefined) updates.title = text(body.title).slice(0, 120);
      if (body.description !== undefined) {
        updates.description = text(body.description).slice(0, 2000);
      }
      if (body.category !== undefined) updates.category = text(body.category);
      if (body.basePrice !== undefined) updates.basePrice = number(body.basePrice);
      if (body.estimatedDuration !== undefined) {
        updates.estimatedDuration = text(body.estimatedDuration);
      }
      if (body.serviceMode !== undefined) updates.serviceMode = text(body.serviceMode);
      if (body.serviceArea !== undefined) updates.serviceArea = text(body.serviceArea);
      if (body.image !== undefined) updates.image = text(body.image);

      if (updates.basePrice !== undefined && Number(updates.basePrice) <= 0) {
        return NextResponse.json(
          { error: "Enter a price greater than zero." },
          { status: 400 }
        );
      }

      if (updates.title === "") {
        return NextResponse.json({ error: "A title is required." }, { status: 400 });
      }

      if (updates.description === "") {
        return NextResponse.json(
          { error: "A description is required." },
          { status: 400 }
        );
      }

      if (body.isAvailable !== undefined) {
        updates.isAvailable = Boolean(body.isAvailable);
      }

      const contentChanged = [
        "title",
        "description",
        "category",
        "basePrice",
        "estimatedDuration",
        "serviceMode",
        "serviceArea",
        "image",
      ].some((field) => updates[field] !== undefined);

      if (contentChanged) {
        updates.approvalStatus = "pending";
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "There is nothing to update." },
        { status: 400 }
      );
    }

    const result = await apiFetch(`/services/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
      body: JSON.stringify(updates),
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: errorMessage(result.data, "Could not update the service.") },
        { status: result.status }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Could not update the service:", error);
    return NextResponse.json(
      { error: "Could not update the service. Please try again." },
      { status: 502 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: _request.headers });

  if (!session) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Invalid service." }, { status: 400 });
  }

  try {
    const jwt = await getBetterAuthJwt(_request.headers);
    const service = await loadService(id);

    if (!service) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    const role = session.user.role ?? "customer";
    const ownsService =
      service.technicianId === session.user.id ||
      service.technicianEmail?.toLowerCase() === session.user.email.toLowerCase();

    if (role !== "admin" && !(role === "technician" && ownsService)) {
      return NextResponse.json(
        { error: "You can only delete your own services." },
        { status: 403 }
      );
    }

    const result = await apiFetch(`/services/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: errorMessage(result.data, "Could not delete the service.") },
        { status: result.status }
      );
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Could not delete the service:", error);
    return NextResponse.json(
      { error: "Could not delete the service. Please try again." },
      { status: 502 }
    );
  }
}
