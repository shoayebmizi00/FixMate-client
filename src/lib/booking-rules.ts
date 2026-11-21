import type { Booking } from "@/lib/types";

// The assignment stores statuses with a hyphen. Older rows used a space, so
// normalising here keeps both working.
export function normalizeBookingStatus(value?: string) {
  return (value ?? "").toLowerCase().replaceAll(" ", "-").replaceAll("_", "-").trim();
}

export const ACTIVE_STATUSES = ["requested", "accepted", "in-progress"];

export const TECHNICIAN_TRANSITIONS: Record<string, string[]> = {
  requested: ["accepted", "rejected"],
  accepted: ["in-progress"],
  "in-progress": ["completed"],
  completed: [],
  rejected: [],
  cancelled: [],
};

export function isActiveStatus(value?: string) {
  return ACTIVE_STATUSES.includes(normalizeBookingStatus(value));
}

export function bookingBelongsToCustomer(
  booking: Booking,
  user: { id: string; email: string }
) {
  return (
    booking.customerId === user.id ||
    booking.customerEmail?.toLowerCase() === user.email.toLowerCase()
  );
}

export function bookingBelongsToTechnician(
  booking: Booking,
  user: { id: string; email: string }
) {
  return (
    booking.technicianId === user.id ||
    booking.technicianEmail?.toLowerCase() === user.email.toLowerCase()
  );
}

export function canCustomerCancel(booking: Booking) {
  return normalizeBookingStatus(booking.status) === "requested";
}

export function canCustomerPay(booking: Booking) {
  return (
    normalizeBookingStatus(booking.status) === "completed" &&
    booking.paymentStatus !== "paid"
  );
}

export function displayAmount(booking: Booking) {
  return booking.finalAmount && booking.finalAmount > 0
    ? booking.finalAmount
    : booking.basePrice;
}
