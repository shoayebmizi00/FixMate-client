"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { BadgeCheck, Clock3, Search, SlidersHorizontal } from "lucide-react";

import type { Service } from "@/lib/services";

type Props = {
  services: Service[];
  initialCategory: string;
  initialSearch: string;
  initialMode: string;
  initialSort: string;
  page: number;
  pages: number;
  total: number;
};

const categories = ["Smartphone", "Laptop & PC", "AC", "Refrigerator", "TV", "Washing Machine", "Electrical"];

function formatPrice(price: number) {
  return `৳${price.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
}

export default function ServiceCatalog({
  services,
  initialCategory,
  initialSearch,
  initialMode,
  initialSort,
  page,
  pages,
  total,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [mode, setMode] = useState(initialMode);
  const [sort, setSort] = useState(initialSort);

  function updateUrl(next: { search?: string; category?: string; mode?: string; sort?: string; page?: number }) {
    const params = new URLSearchParams();
    const values = {
      search: next.search ?? search,
      category: next.category ?? category,
      mode: next.mode ?? mode,
      sort: next.sort ?? sort,
      page: next.page ?? 1,
    };

    if (values.search) params.set("search", values.search);
    if (values.category) params.set("category", values.category);
    if (values.mode) params.set("mode", values.mode);
    if (values.sort && values.sort !== "newest") params.set("sort", values.sort);
    if (values.page > 1) params.set("page", String(values.page));
    router.push(`/services${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateUrl({ search, category, mode, sort, page: 1 });
  }

  function resetFilters() {
    setSearch("");
    setCategory("");
    setMode("");
    setSort("newest");
    router.push("/services");
  }

  return (
    <div>
      <form onSubmit={submitFilters} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filter repairs
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
          <label className="relative">
            <span className="sr-only">Search repairs</span>
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title or category" className="h-11 w-full rounded-xl border border-slate-200 bg-white pr-3 pl-9 text-sm text-slate-800 outline-none focus:border-blue-400" />
          </label>
          <label>
            <span className="sr-only">Filter by category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">
              <option value="">All categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by service mode</span>
            <select value={mode} onChange={(event) => setMode(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">
              <option value="">All service modes</option>
              <option value="Home Visit">Home Visit</option>
              <option value="Shop Drop-off">Shop Drop-off</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Sort repairs</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">
              <option value="newest">Newest first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="title">Title: A to Z</option>
            </select>
          </label>
          <div className="flex gap-2">
            <button type="submit" className="h-11 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white">Apply</button>
            <button type="button" onClick={resetFilters} className="h-11 rounded-xl px-3 text-sm font-medium text-slate-600 hover:bg-slate-100">Reset</button>
          </div>
        </div>
      </form>

      <p className="my-4 text-sm text-slate-500" role="status" aria-live="polite">{total} {total === 1 ? "repair" : "repairs"} found</p>

      {services.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {services.map((service) => (
            <article key={service._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md">
              <Link href={`/services/${encodeURIComponent(service.slug)}`} className="relative block aspect-[1.35] overflow-hidden bg-slate-100">
                {service.image ? (
                  <Image src={service.image} alt={`${service.title} repair`} fill sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                ) : (
                  <span className="grid size-full place-items-center text-sm text-slate-500">Repair service</span>
                )}
              </Link>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 uppercase">{service.category}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700"><BadgeCheck className="size-3.5" />Approved</span>
                </div>
                <h2 className="mt-3 truncate text-[15px] font-semibold text-slate-900">{service.title}</h2>
                <p className="mt-1 text-xs text-slate-500">{service.serviceArea || "Area available after request"}</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500"><Clock3 className="size-3.5" />{service.estimatedDuration}</span>
                  <span className="text-sm font-bold text-slate-900">{formatPrice(service.basePrice)}</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{service.technicianName || "Verified technician"} · {service.serviceMode}</p>
                <Link href={`/services/${encodeURIComponent(service.slug)}`} className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-full bg-blue-600 text-[12.5px] font-semibold text-white hover:bg-blue-700">
                  View details
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <h2 className="text-base font-semibold text-slate-900">No matching services</h2>
          <p className="mt-2 text-sm text-slate-500">Try different search words or reset the filters.</p>
          <button type="button" onClick={resetFilters} className="mt-5 h-10 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white">Reset filters</button>
        </div>
      )}

      {pages > 1 ? (
        <nav className="mt-6 flex justify-center gap-2" aria-label="Service pages">
          <button type="button" disabled={page <= 1} onClick={() => updateUrl({ page: page - 1 })} className="h-10 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700 disabled:opacity-50">Previous</button>
          {Array.from({ length: pages }, (_, index) => index + 1).map((number) => (
            <button key={number} type="button" onClick={() => updateUrl({ page: number })} className={number === page ? "h-10 rounded-full bg-blue-600 px-4 text-sm font-semibold text-white" : "h-10 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700"}>
              {number}
            </button>
          ))}
          <button type="button" disabled={page >= pages} onClick={() => updateUrl({ page: page + 1 })} className="h-10 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700 disabled:opacity-50">Next</button>
        </nav>
      ) : null}
    </div>
  );
}
