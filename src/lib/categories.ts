// The assignment defines exactly seven repair categories and two service modes.
// Keep them in one place so the public pages, forms and admin screens agree.
export const SERVICE_CATEGORIES = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
] as const;

export const SERVICE_MODES = ["Home Visit", "Shop Drop-off"] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];
export type ServiceMode = (typeof SERVICE_MODES)[number];

export const BOOKING_STATUSES = [
  "requested",
  "accepted",
  "in-progress",
  "completed",
  "rejected",
  "cancelled",
] as const;

export function categoryIconName(category: string) {
  return category.toLowerCase();
}
