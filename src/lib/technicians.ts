import { connection } from "next/server";

export type TechnicianService = {
  id: string;
  title: string;
  category: string;
};

export type Technician = {
  id: string;
  name: string;
  email: string;
  image?: string;
  area?: string;
  bio?: string;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  skills: string[];
  repairs: number;
  services: TechnicianService[];
};

type RawUser = {
  _id: string;
  name: string;
  email: string;
  role?: string;
  image?: string;
  area?: string;
  bio?: string;
  phone?: string;
  rating?: number;
  reviewCount?: number;
};

type RawService = {
  _id: string;
  title: string;
  category: string;
  technicianId?: string;
  technicianEmail?: string;
  isAvailable?: boolean;
};

function isRawUser(value: unknown): value is RawUser {
  if (typeof value !== "object" || value === null) return false;

  const user = value as Record<string, unknown>;
  return (
    typeof user._id === "string" &&
    typeof user.name === "string" &&
    typeof user.email === "string"
  );
}

function isRawService(value: unknown): value is RawService {
  if (typeof value !== "object" || value === null) return false;

  const service = value as Record<string, unknown>;
  return (
    typeof service._id === "string" &&
    typeof service.title === "string" &&
    typeof service.category === "string"
  );
}

function apiBaseUrl() {
  const baseUrl = process.env.BASE_API_URL;
  if (!baseUrl) throw new Error("BASE_API_URL is not configured.");
  return baseUrl.replace(/\/$/, "");
}

/**
 * Loads every registered technician from the FixMate API.
 *
 * `/users` has the account data (name, photo, role) and `/services` is used to
 * work out each technician's specialties and how many repairs they published.
 */
export async function fetchTechnicians(): Promise<Technician[]> {
  // Skip prerendering so the request runs at real request time.
  await connection();

  const response = await fetch(`${apiBaseUrl()}/users`);

  if (!response.ok) {
    throw new Error(`Technicians request failed: ${response.status}`);
  }

  const usersData: unknown = await response.json();
  if (!Array.isArray(usersData)) {
    throw new Error("Technicians response is invalid.");
  }

  const servicesResponse = await fetch(`${apiBaseUrl()}/services?all=true&limit=100`);

  let servicesData: unknown = [];
  if (servicesResponse.ok) {
    const payload: unknown = await servicesResponse.json();
    servicesData =
      typeof payload === "object" &&
      payload !== null &&
      Array.isArray((payload as { services?: unknown }).services)
        ? (payload as { services: unknown[] }).services
        : [];
  }

  const services = Array.isArray(servicesData)
    ? servicesData.filter(isRawService)
    : [];

  return usersData
    .filter(isRawUser)
    .filter((user) => user.role?.toLowerCase() === "technician")
    .map((user) => {
      const ownServices = services.filter(
        (service) =>
          (service.technicianId && service.technicianId === user._id) ||
          (service.technicianEmail && service.technicianEmail === user.email)
      );

      const availableServices = ownServices.filter(
        (service) => service.isAvailable !== false
      );

      const skills = [
        ...new Set(
          availableServices
            .map((service) => service.category.trim())
            .filter(Boolean)
        ),
      ].slice(0, 3);

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        area: user.area,
        bio: user.bio,
        phone: user.phone,
        rating: typeof user.rating === "number" ? user.rating : undefined,
        reviewCount:
          typeof user.reviewCount === "number" ? user.reviewCount : undefined,
        skills,
        repairs: availableServices.length,
        services: availableServices.map((service) => ({
          id: service._id,
          title: service.title,
          category: service.category,
        })),
      };
    })
    .sort((first, second) => first.name.localeCompare(second.name));
}
