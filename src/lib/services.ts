import { connection } from "next/server";

import airConditionerFallback from "@/assets/5.png";

const unavailableAirConditionerThumbnail =
  "https://images.unsplash.com/photo-1631545806609-7e8e7f4a7f8a";

export type Service = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  estimatedDuration: string;
  thumbnail?: string;
  images?: string[];
  isActive: boolean;
  approvalStatus: string;
  createdAt?: string;
  serviceMode?: string;
  serviceType?: string;
  mode?: string;
  location?: string;
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
    typeof service.price === "number" &&
    typeof service.estimatedDuration === "string" &&
    typeof service.isActive === "boolean" &&
    typeof service.approvalStatus === "string" &&
    (service.thumbnail === undefined || typeof service.thumbnail === "string") &&
    (service.images === undefined ||
      (Array.isArray(service.images) &&
        service.images.every((image) => typeof image === "string"))) &&
    (service.createdAt === undefined || typeof service.createdAt === "string") &&
    (service.serviceMode === undefined ||
      typeof service.serviceMode === "string") &&
    (service.serviceType === undefined ||
      typeof service.serviceType === "string") &&
    (service.mode === undefined || typeof service.mode === "string") &&
    (service.location === undefined || typeof service.location === "string")
  );
}

export async function fetchApprovedServices(): Promise<Service[]> {
  // Skip prerendering: the API must be called per request, not baked into the
  // static shell. Without this, the fetch is still in flight when the prerender
  // finishes and React reports HANGING_PROMISE_REJECTION.
  await connection();

  const baseUrl = process.env.BASE_API_URL;
  if (!baseUrl) throw new Error("BASE_API_URL is not configured.");

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/services`);
  if (!response.ok) {
    throw new Error(`Services request failed: ${response.status}`);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error("Services response is invalid.");

  return data
    .filter(isService)
    .filter(
      (service) =>
        service.isActive && service.approvalStatus.toLowerCase() === "approved"
    )
    .map((service) => ({
      ...service,
      thumbnail:
        service.thumbnail === unavailableAirConditionerThumbnail
          ? airConditionerFallback.src
          : service.thumbnail || service.images?.[0],
    }))
    .sort(
      (first, second) =>
        new Date(second.createdAt ?? 0).getTime() -
        new Date(first.createdAt ?? 0).getTime()
    );
}
