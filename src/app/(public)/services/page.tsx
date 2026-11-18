import { Suspense } from "react";

import ServiceCatalog from "../components/services/ServiceCatalog";
import { fetchApprovedServices, type Service } from "@/lib/services";

type SearchParams = Promise<{
  category?: string | string[];
}>;

async function ServiceResults({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  let category = "";
  let services: Service[];

  try {
    const [params, approvedServices] = await Promise.all([
      searchParams,
      fetchApprovedServices(),
    ]);
    category = typeof params.category === "string" ? params.category : "";
    services = approvedServices;
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
      key={category}
      services={services}
      initialCategory={category}
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
