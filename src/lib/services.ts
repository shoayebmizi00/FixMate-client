import { connection } from "next/server";

import airConditionerFallback from "@/assets/5.png";
import type { Service, ServicePage } from "@/lib/types";

export type { Service, ServicePage } from "@/lib/types";

const unavailableAirConditionerThumbnail =
  "https://images.unsplash.com/photo-1631545806609-7e8e7f4a7f8a";

export type ServiceFilters = {
  search?: string;
  category?: string;
  mode?: string;
  sort?: string;
  page?: number;
  limit?: number;
  all?: boolean;
  approvalStatus?: string;
  technicianId?: string;
  technicianEmail?: string;
};

function isService(value: unknown): value is Service {
  if (typeof value !== "object" || value === null) return false;

  const service = value as Record<string, unknown>;
  return (
    typeof service._id === "string" &&
    typeof service.title === "string" &&
    typeof service.slug === "string" &&
    typeof service.description === "string" &&
    typeof service.category === "string" &&
    typeof service.basePrice === "number" &&
    typeof service.estimatedDuration === "string" &&
    typeof service.isAvailable === "boolean" &&
    typeof service.approvalStatus === "string" &&
    (service.image === undefined || typeof service.image === "string") &&
    (service.serviceMode === undefined || typeof service.serviceMode === "string") &&
    (service.serviceArea === undefined || typeof service.serviceArea === "string") &&
    (service.technicianName === undefined || typeof service.technicianName === "string") &&
    (service.technicianEmail === undefined || typeof service.technicianEmail === "string") &&
    (service.createdAt === undefined || typeof service.createdAt === "string")
  );
}

function normalizeService(service: Service): Service {
  return {
    ...service,
    image:
      service.image === unavailableAirConditionerThumbnail
        ? airConditionerFallback.src
        : service.image || service.images?.[0] || "",
  };
}

function buildQuery(filters: ServiceFilters) {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.mode) params.set("mode", filters.mode);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.all) params.set("all", "true");
  if (filters.approvalStatus) params.set("approvalStatus", filters.approvalStatus);
  if (filters.technicianId) params.set("technicianId", filters.technicianId);
  if (filters.technicianEmail) params.set("technicianEmail", filters.technicianEmail);

  const query = params.toString();
  return query ? `?${query}` : "";
}

function apiBaseUrl() {
  const baseUrl = process.env.BASE_API_URL;
  if (!baseUrl) throw new Error("BASE_API_URL is not configured.");
  return baseUrl.replace(/\/$/, "");
}

export async function fetchServicePage(filters: ServiceFilters = {}): Promise<ServicePage> {
  // Skip prerendering: the API must be called per request, not baked into the
  // static shell. Without this, React reports HANGING_PROMISE_REJECTION.
  await connection();

  const response = await fetch(`${apiBaseUrl()}/services${buildQuery(filters)}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Services request failed: ${response.status}`);
  }

  const data: unknown = await response.json();

  if (typeof data !== "object" || data === null) {
    throw new Error("Services response is invalid.");
  }

  const payload = data as {
    services?: unknown;
    total?: number;
    page?: number;
    pages?: number;
    limit?: number;
  };

  const services = Array.isArray(payload.services)
    ? payload.services.filter(isService).map(normalizeService)
    : [];

  return {
    services,
    total: typeof payload.total === "number" ? payload.total : services.length,
    page: typeof payload.page === "number" ? payload.page : 1,
    pages: typeof payload.pages === "number" ? payload.pages : 1,
    limit: typeof payload.limit === "number" ? payload.limit : services.length,
  };
}

// Used by the home page and other places that only need a list.
export async function fetchApprovedServices(
  filters: ServiceFilters = {}
): Promise<Service[]> {
  const page = await fetchServicePage({ limit: 100, ...filters });
  return page.services;
}

export async function fetchServiceById(idOrSlug: string): Promise<Service | null> {
  await connection();

  const response = await fetch(
    `${apiBaseUrl()}/services/${encodeURIComponent(idOrSlug)}`,
    { cache: "no-store" }
  );

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Service request failed: ${response.status}`);
  }

  const data: unknown = await response.json();
  return isService(data) ? normalizeService(data) : null;
}
