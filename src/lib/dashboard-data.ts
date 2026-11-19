import { connection } from "next/server";

export type DashboardUser = {
  _id: string;
  name: string;
  email: string;
  role?: string;
  image?: string;
  phone?: string;
  serviceArea?: string;
  bio?: string;
  createdAt?: string;
};

export type DashboardService = {
  _id: string;
  title: string;
  category?: string;
  description?: string;
  price?: number;
  thumbnail?: string;
  location?: string;
  serviceMode?: string;
  approvalStatus?: string;
  isActive?: boolean;
  technicianId?: string;
  createdAt?: string;
};

export type Booking = {
  _id: string;
  serviceId?: string;
  serviceTitle?: string;
  service?: { title?: string };
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customer?: { name?: string; email?: string };
  technicianId?: string;
  technicianName?: string;
  technician?: { name?: string };
  preferredDate?: string;
  status?: string;
  paymentStatus?: string;
  amount?: number;
  createdAt?: string;
};

export type Transaction = {
  _id: string;
  bookingId?: string;
  customerId?: string;
  customerName?: string;
  technicianName?: string;
  amount?: number;
  status?: string;
  method?: string;
  reference?: string;
  createdAt?: string;
};

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

function isService(value: unknown): value is DashboardService {
  return (
    isRecord(value) &&
    typeof value._id === "string" &&
    typeof value.title === "string"
  );
}

function isBooking(value: unknown): value is Booking {
  return isRecord(value) && typeof value._id === "string";
}

function isTransaction(value: unknown): value is Transaction {
  return isRecord(value) && typeof value._id === "string";
}

// Calls one list endpoint on the FixMate API and always returns an array.
async function fetchList(path: string): Promise<unknown[]> {
  await connection();

  const baseUrl = process.env.BASE_API_URL;
  if (!baseUrl) throw new Error("BASE_API_URL is not configured.");

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`${path} request failed: ${response.status}`);
  }

  const data: unknown = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchAllUsers(): Promise<DashboardUser[]> {
  const data = await fetchList("/users");
  return data.filter(isUser);
}

export async function fetchAllServices(): Promise<DashboardService[]> {
  const data = await fetchList("/services");
  return data.filter(isService);
}

export async function fetchAllBookings(): Promise<Booking[]> {
  const data = await fetchList("/bookings");
  return data.filter(isBooking);
}

export async function fetchAllTransactions(): Promise<Transaction[]> {
  const data = await fetchList("/transactions");
  return data.filter(isTransaction);
}
