import { connection } from "next/server";

export type TechnicianService = {
  id: string;
  title: string;
  category: string;
};

export type Technician = {
  id: string;
  name: string;
  image?: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
  skills: string[];
  repairs: number;
  services: TechnicianService[];
};

type RawUser = {
  _id: string;
  name: string;
  role?: string;
  image?: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
};

type RawService = {
  _id: string;
  title: string;
  category: string;
  technicianId: string;
  isActive?: boolean;
};

function isRawUser(value: unknown): value is RawUser {
  if (typeof value !== "object" || value === null) return false;

  const user = value as Record<string, unknown>;
  return typeof user._id === "string" && typeof user.name === "string";
}

function isRawService(value: unknown): value is RawService {
  if (typeof value !== "object" || value === null) return false;

  const service = value as Record<string, unknown>;
  return (
    typeof service._id === "string" &&
    typeof service.title === "string" &&
    typeof service.category === "string" &&
    typeof service.technicianId === "string"
  );
}

/**
 * Loads every registered technician from the FixMate API.
 *
 * `/users` has the account data (name, photo, role) and `/services` is used to
 * work out each technician's specialties and how many repairs they published.
 */
export async function fetchTechnicians(): Promise<Technician[]> {
  // Skip prerendering so the request runs at real request time. Otherwise the
  // in-flight fetch rejects after the prerender completes and Next reports
  // HANGING_PROMISE_REJECTION.
  await connection();

  const baseUrl = process.env.BASE_API_URL;
  if (!baseUrl) throw new Error("BASE_API_URL is not configured.");

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/users`);

  if (!response.ok) {
    throw new Error(`Technicians request failed: ${response.status}`);
  }

  const usersData: unknown = await response.json();
  if (!Array.isArray(usersData)) {
    throw new Error("Technicians response is invalid.");
  }

  const servicesResponse = await fetch(`${baseUrl.replace(/\/$/, "")}/services`);

  let servicesData: unknown = [];
  if (servicesResponse.ok) {
    servicesData = await servicesResponse.json();
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
          service.technicianId === user._id && service.isActive !== false
      );

      const skills = [
        ...new Set(
          ownServices.map((service) => service.category.trim()).filter(Boolean)
        ),
      ].slice(0, 3);

      return {
        id: user._id,
        name: user.name,
        image: user.image,
        location: user.location,
        rating: typeof user.rating === "number" ? user.rating : undefined,
        reviewCount:
          typeof user.reviewCount === "number" ? user.reviewCount : undefined,
        skills,
        repairs: ownServices.length,
        services: ownServices.map((service) => ({
          id: service._id,
          title: service.title,
          category: service.category,
        })),
      };
    })
    .sort((first, second) => first.name.localeCompare(second.name));
}
