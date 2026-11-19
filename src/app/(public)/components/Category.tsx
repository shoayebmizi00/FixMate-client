import Link from "next/link";
import { connection } from "next/server";
import {
  AirVent,
  ArrowUpRight,
  House,
  Laptop,
  Refrigerator,
  Smartphone,
  Tv,
  WashingMachine,
  Wrench,
  Zap,
} from "lucide-react";

type ServiceCategory = {
  category?: string;
  isActive?: boolean;
  approvalStatus?: string;
};

function isServiceCategory(value: unknown): value is ServiceCategory {
  if (typeof value !== "object" || value === null) return false;

  const service = value as Record<string, unknown>;
  return (
    typeof service.category === "string" &&
    typeof service.isActive === "boolean" &&
    typeof service.approvalStatus === "string"
  );
}

function getCategoryIcon(category: string) {
  const value = category.toLowerCase();

  if (value.includes("electrical")) return Zap;
  if (value.includes("electronic")) return Laptop;
  if (value.includes("appliance")) return Refrigerator;
  if (value.includes("home")) return House;
  if (value.includes("air") || value.includes("ac")) return AirVent;
  if (value.includes("television") || value.includes("tv")) return Tv;
  if (value.includes("washing")) return WashingMachine;
  if (value.includes("phone") || value.includes("mobile")) return Smartphone;
  return Wrench;
}

async function fetchCategories() {
  // Wait for an actual request so this fetch is not left in flight when the
  // static shell finishes prerendering.
  await connection();

  const baseUrl = process.env.BASE_API_URL;
  if (!baseUrl) throw new Error("BASE_API_URL is not configured.");

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/services`);
  if (!response.ok) throw new Error(`Services request failed: ${response.status}`);

  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error("Services response is invalid.");

  return [
    ...new Set(
      data
        .filter(isServiceCategory)
        .filter(
          (service) =>
            service.isActive === true && service.approvalStatus === "approved"
        )
        .map((service) => service.category?.trim())
        .filter((category): category is string => Boolean(category))
    ),
  ].sort((first, second) => first.localeCompare(second));
}

export default async function Category() {
  // Outside the try/catch on purpose: during prerendering `connection()`
  // rejects to abort the render, and catching that would bake the error
  // fallback into the static shell.
  await connection();

  let categories: string[] = [];

  try {
    categories = await fetchCategories();
  } catch (error) {
    console.error("Could not load service categories:", error);
    return (
      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p role="status" className="text-sm text-slate-600">
            Categories are temporarily unavailable.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#f6f9fc] px-4 py-12 font-[family-name:var(--font-geist-sans)] sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-blue-600 uppercase">
              Popular categories
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              What needs fixing today?
            </h2>
          </div>
          <Link
            href="/services"
            className="mb-1 hidden shrink-0 items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 sm:inline-flex"
          >
            Browse all services
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7">
            {categories.map((category) => {
              const Icon = getCategoryIcon(category);

              return (
                <Link
                  key={category}
                  href={`/services?category=${encodeURIComponent(category)}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-slate-50 text-slate-800 transition-colors group-hover:bg-blue-50 group-hover:text-blue-700">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-3 truncate text-sm font-semibold text-slate-900">
                    {category}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500">Book a repair</p>
                </Link>
              );
            })}
          </div>
        ) : (
          <p role="status" className="text-sm text-slate-600">
            No service categories are available yet.
          </p>
        )}

        <Link
          href="/services"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 sm:hidden"
        >
          Browse all services
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
