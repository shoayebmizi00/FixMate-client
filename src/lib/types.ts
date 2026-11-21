// Shared data shapes for the FixMate client.
// These names match the assignment's four collections: users, services,
// bookings and payments.

export type UserRole = "customer" | "technician" | "admin";

export type DashboardUser = {
  _id: string;
  name: string;
  email: string;
  role?: string;
  image?: string;
  phone?: string;
  area?: string;
  bio?: string;
  createdAt?: string;
};

export type Service = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  basePrice: number;
  estimatedDuration: string;
  image?: string;
  images?: string[];
  technicianId?: string;
  technicianName?: string;
  technicianEmail?: string;
  serviceArea?: string;
  serviceMode?: string;
  approvalStatus: string;
  isAvailable: boolean;
  createdAt?: string;
  price?: number;
  thumbnail?: string;
  isActive?: boolean;
  location?: string;
  serviceType?: string;
  mode?: string;
};

export type ServicePage = {
  services: Service[];
  total: number;
  page: number;
  pages: number;
  limit: number;
};

export type BookingStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "in-progress"
  | "completed"
  | "cancelled";

export type StatusHistoryEntry = {
  status: string;
  changedAt: string;
};

export type Booking = {
  _id: string;
  serviceId: string;
  serviceTitle: string;
  serviceImage?: string;
  category?: string;
  basePrice: number;
  finalAmount?: number;
  technicianId?: string;
  technicianName?: string;
  technicianEmail?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  address?: string;
  preferredDate?: string;
  problemDescription?: string;
  status: string;
  paymentStatus: string;
  statusHistory?: StatusHistoryEntry[];
  createdAt?: string;
  amount?: number;
  service?: { title?: string };
  customer?: { name?: string; email?: string };
  technician?: { name?: string; email?: string };
};

export type Payment = {
  _id: string;
  bookingId?: string;
  serviceTitle?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  technicianId?: string;
  technicianName?: string;
  technicianEmail?: string;
  amount: number;
  currency?: string;
  transactionId?: string;
  stripeSessionId?: string;
  paymentStatus?: string;
  paidAt?: string;
  createdAt?: string;
};

export function normalizeStatus(value?: string) {
  return (value ?? "")
    .toLowerCase()
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .trim();
}

export function humanizeStatus(value?: string) {
  const text = normalizeStatus(value);
  if (!text) return "Unknown";

  return text.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function bookingAmount(booking: Booking) {
  return booking.finalAmount && booking.finalAmount > 0
    ? booking.finalAmount
    : booking.basePrice;
}
