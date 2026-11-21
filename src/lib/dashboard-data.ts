import { connection } from "next/server";
import { headers } from "next/headers";
import { getBetterAuthJwt } from "@/lib/server-jwt";

import type {
  Booking,
  DashboardUser,
  Payment,
  Service,
} from "@/lib/types";

export type { Booking, DashboardUser, Payment, Service };
export type DashboardService = Service;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUser(value: unknown): value is DashboardUser {
  return (
    isRecord(value) &&
    typeof value._id === "string" &&
    typeof value.name === "string" &&
    typeof value.email === "string"
  );
}

function isService(value: unknown): value is Service {
  return (
    isRecord(value) &&
    typeof value._id === "string" &&
    typeof value.title === "string" &&
    typeof value.basePrice === "number"
  );
}

function isBooking(value: unknown): value is Booking {
  return (
    isRecord(value) &&
    typeof value._id === "string" &&
    typeof value.serviceTitle === "string"
  );
}

function isPayment(value: unknown): value is Payment {
  return (
    isRecord(value) &&
    typeof value._id === "string" &&
    typeof value.amount === "number"
  );
}

function apiBaseUrl() {
  const baseUrl = process.env.BASE_API_URL;
  if (!baseUrl) throw new Error("BASE_API_URL is not configured.");
  return baseUrl.replace(/\/$/, "");
}

async function fetchList(path: string): Promise<unknown[]> {
  await connection();
  const jwt = await getBetterAuthJwt(await headers());

  const response = await fetch(`${apiBaseUrl()}${path}`, {
    cache: "no-store",
    headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
  });

  if (!response.ok) {
    throw new Error(`${path} request failed: ${response.status}`);
  }

  const data: unknown = await response.json();

  if (Array.isArray(data)) return data;

  // `/services` returns a paginated envelope.
  if (isRecord(data) && Array.isArray(data.services)) {
    return data.services;
  }

  return [];
}

export async function fetchAllUsers(): Promise<DashboardUser[]> {
  const data = await fetchList("/users");
  return data.filter(isUser);
}

export async function fetchAllServices(): Promise<Service[]> {
  const data = await fetchList("/services?all=true&limit=100");
  return data.filter(isService);
}

export async function fetchAllBookings(): Promise<Booking[]> {
  const data = await fetchList("/bookings");
  return data.filter(isBooking);
}

export async function fetchAllPayments(): Promise<Payment[]> {
  const data = await fetchList("/payments");
  return data.filter(isPayment);
}

export async function fetchBookingById(id: string): Promise<Booking | null> {
  await connection();
  const jwt = await getBetterAuthJwt(await headers());

  const response = await fetch(`${apiBaseUrl()}/bookings/${encodeURIComponent(id)}`, {
    cache: "no-store",
    headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Booking request failed: ${response.status}`);
  }

  const data: unknown = await response.json();
  return isBooking(data) ? data : null;
}
