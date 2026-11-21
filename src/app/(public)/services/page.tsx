import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import ServiceCatalog from "../components/services/ServiceCatalog";
import { fetchServicePage, type Service } from "@/lib/services";
import { getCurrentSession } from "@/lib/session";

type SearchParams = Promise<{
  category?: string | string[];
  search?: string | string[];
  q?: string | string[];
  mode?: string | string[];
  sort?: string | string[];
  page?: string | string[];
}>;

async function ServiceResults({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  let category = "";
  let search = "";
  let mode = "";
  let sort = "newest";
  let page = 1;
  let services: Service[] = [];
  let total = 0;
  let pages = 1;

  // `searchParams` is request-time data. This must stay outside the try/catch:
  // during prerendering `connection()` rejects to abort this render, and if the
  // error is caught the static shell would show the fallback instead.
  await connection();

  try {
    const params = await searchParams;
    category = typeof params.category === "string" ? params.category : "";
    search =
      typeof params.search === "string"
        ? params.search
        : typeof params.q === "string"
          ? params.q
          : "";
    mode = typeof params.mode === "string" ? params.mode : "";
    sort = typeof params.sort === "string" ? params.sort : "newest";
    page = typeof params.page === "string" ? Math.max(1, Number(params.page) || 1) : 1;
    const result = await fetchServicePage({
      category: category || undefined,
      search: search || undefined,
      mode: mode || undefined,
      sort,
      page,
      limit: 12,
    });
    services = result.services;
    total = result.total;
    pages = result.pages;
  } catch (error) {
    console.error("Could not load services:", error);
    return (
      <p
        role="alert"
        className="rounded-2xl border border-rose-200 bg-white p-6 text-sm text-rose-700"
      >
        Services are temporarily unavailable. Please try again later.
      </p>
    );
  }

  return (
    <ServiceCatalog
      key={`${category}-${search}-${mode}-${sort}-${page}`}
      services={services}
      initialCategory={category}
      initialSearch={search}
      initialMode={mode}
      initialSort={sort}
      page={page}
      pages={pages}
      total={total}
    />
  );
}

function ServiceCatalogSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading services" role="status">
      <div className="h-20 animate-pulse rounded-2xl bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-72 animate-pulse rounded-2xl bg-slate-200"
          />
        ))}
      </div>
    </div>
  );
}

export default function ServicesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sessionPromise = getCurrentSession();

  // Return technicians to their dashboard. Only customers and visitors can browse services.
  return (
    <ServicePageGuard
      searchParams={searchParams}
      sessionPromise={sessionPromise}
    />
  );
}

async function ServicePageGuard({
  searchParams,
  sessionPromise,
}: {
  searchParams: SearchParams;
  sessionPromise: ReturnType<typeof getCurrentSession>;
}) {
  const session = await sessionPromise;
  if (session?.user.role === "technician") {
    redirect("/dashboard/technician");
  }

  return (
    <main className="min-h-[65vh] bg-[#f6f9fc] px-4 py-10 font-[family-name:var(--font-geist-sans)] sm:px-6 sm:py-12 lg:px-8">
      <div className="container mx-auto">
        <header className="mb-6">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-blue-600 uppercase">
            Service catalogue
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Find the right repair
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 sm:text-base">
            Every listing is published by a registered technician and approved
            by FixMate before it appears here.
          </p>
        </header>

        <Suspense fallback={<ServiceCatalogSkeleton />}>
          <ServiceResults searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
