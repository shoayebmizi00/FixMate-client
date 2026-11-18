"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BadgeCheck, Clock3, Search, SlidersHorizontal } from "lucide-react";

import type { Service } from "@/lib/services";

type Props = {
  services: Service[];
  initialCategory: string;
};

function getServiceMode(service: Service) {
  return service.serviceMode ?? service.serviceType ?? service.mode ?? "";
}

function formatPrice(price: number) {
  return `৳${price.toLocaleString("en-BD")}`;
}

export default function ServiceCatalog({ services, initialCategory }: Props) {
  const categories = [...new Set(services.map((service) => service.category))].sort(
    (first, second) => first.localeCompare(second)
  );
  const modes = [
    ...new Set(services.map(getServiceMode).filter((mode) => mode.length > 0)),
  ].sort((first, second) => first.localeCompare(second));

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(
    categories.includes(initialCategory) ? initialCategory : ""
  );
  const [mode, setMode] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [sort, setSort] = useState("newest");

  const filteredServices = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    const filtered = services.filter((service) => {
      const matchesSearch =
        !searchTerm ||
        `${service.title} ${service.category} ${service.description}`
          .toLowerCase()
          .includes(searchTerm);
      const matchesCategory = !category || service.category === category;
      const matchesMode = !mode || getServiceMode(service) === mode;
      const matchesPrice =
        !priceRange ||
        (priceRange === "under-500" && service.price <= 500) ||
        (priceRange === "500-800" &&
          service.price > 500 &&
          service.price <= 800) ||
        (priceRange === "over-800" && service.price > 800);

      return (
        matchesSearch && matchesCategory && matchesMode && matchesPrice
      );
    });

    if (sort === "price-low") {
      return filtered.sort((first, second) => first.price - second.price);
    }
    if (sort === "price-high") {
      return filtered.sort((first, second) => second.price - first.price);
    }
    if (sort === "title") {
      return filtered.sort((first, second) =>
        first.title.localeCompare(second.title)
      );
    }

    return filtered.sort(
      (first, second) =>
        new Date(second.createdAt ?? 0).getTime() -
        new Date(first.createdAt ?? 0).getTime()
    );
  }, [category, mode, priceRange, search, services, sort]);

  function resetFilters() {
    setSearch("");
    setCategory("");
    setMode("");
    setPriceRange("");
    setSort("newest");
    window.history.replaceState(null, "", window.location.pathname);
  }

  function updateCategory(value: string) {
    setCategory(value);

    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }

    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      query ? `${window.location.pathname}?${query}` : window.location.pathname
    );
  }

  return (
    <div>
      <section
        aria-labelledby="filter-heading"
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <h2
          id="filter-heading"
          className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filter repairs
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
          <label className="relative">
            <span className="sr-only">Search repairs</span>
            <Search
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title or category"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-3 pl-9 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label>
            <span className="sr-only">Filter by category</span>
            <select
              value={category}
              onChange={(event) => updateCategory(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          {modes.length > 0 ? (
            <label>
              <span className="sr-only">Filter by service mode</span>
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All service modes</option>
                {modes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label>
              <span className="sr-only">Filter by price range</span>
              <select
                value={priceRange}
                onChange={(event) => setPriceRange(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Any price</option>
                <option value="under-500">Up to ৳500</option>
                <option value="500-800">৳501–৳800</option>
                <option value="over-800">Over ৳800</option>
              </select>
            </label>
          )}

          <label>
            <span className="sr-only">Sort repairs</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="newest">Newest first</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="title">Title: A to Z</option>
            </select>
          </label>

          <button
            type="button"
            onClick={resetFilters}
            className="h-11 rounded-xl px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Reset
          </button>
        </div>
      </section>

      <p className="my-4 text-sm text-slate-500" role="status" aria-live="polite">
        {filteredServices.length}{" "}
        {filteredServices.length === 1 ? "repair" : "repairs"} found
      </p>

      {filteredServices.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filteredServices.map((service) => (
            <article
              key={service._id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md"
            >
              <Link
                href={`/services/${encodeURIComponent(service.slug)}`}
                aria-label={`View ${service.title}`}
                className="relative block aspect-[1.35] overflow-hidden bg-slate-100"
              >
                {service.thumbnail ? (
                  <Image
                    src={service.thumbnail}
                    alt={`${service.title} repair`}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                  />
                ) : (
                  <span className="grid size-full place-items-center text-sm text-slate-400">
                    Repair service
                  </span>
                )}
              </Link>

              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="max-w-[65%] truncate rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-slate-600 uppercase">
                    {service.category}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-600">
                    <BadgeCheck className="size-3.5" aria-hidden="true" />
                    Verified
                  </span>
                </div>

                <h3 className="mt-3 truncate text-base font-semibold text-slate-900">
                  {service.title}
                </h3>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock3
                    className="size-3.5 shrink-0 text-slate-400"
                    aria-hidden="true"
                  />
                  {service.estimatedDuration}
                  {getServiceMode(service) && ` · ${getServiceMode(service)}`}
                </p>

                <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
                  <div>
                    <p className="text-[10px] font-medium tracking-[0.12em] text-slate-500 uppercase">
                      Starting at
                    </p>
                    <p className="mt-0.5 text-lg font-bold text-slate-900">
                      {formatPrice(service.price)}
                    </p>
                  </div>
                  <Link
                    href={`/services/${encodeURIComponent(service.slug)}`}
                    className="inline-flex h-9 items-center rounded-full border border-slate-200 px-4 text-xs font-semibold text-slate-800 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            No repairs match these filters
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Try a different search or reset your filters.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
