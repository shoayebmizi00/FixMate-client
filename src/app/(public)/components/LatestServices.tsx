import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowUpRight, BadgeCheck, Clock3 } from "lucide-react";

import type { Service } from "@/lib/types";
import { fetchServicePage } from "@/lib/services";

async function fetchLatestServices() {
  // Wait for an actual request so this fetch is not left in flight when the
  // static shell finishes prerendering.
  await connection();

  const page = await fetchServicePage({ limit: 6, sort: "newest" });
  return page.services;
}

export default async function LatestServices() {
  // Outside the try/catch on purpose: during prerendering `connection()`
  // rejects to abort the render, and catching that would bake the error
  // fallback into the static shell.
  await connection();

  let services: Service[] = [];

  try {
    services = await fetchLatestServices();
  } catch (error) {
    console.error("Could not load latest services:", error);
    return (
      <section className="bg-[#f6f9fc] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p role="status" className="text-sm text-slate-600">
            Services are temporarily unavailable.
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
              Latest approved services
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Recently added repairs
            </h2>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Fresh listings from verified technicians across all repair
              categories.
            </p>
          </div>
          <Link
            href="/services"
            className="mb-1 hidden shrink-0 items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 sm:inline-flex"
          >
            View all services
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {services.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md"
              >
                <Link
                  href={`/services/${encodeURIComponent(service.slug)}`}
                  aria-label={`View ${service.title}`}
                  className="relative block aspect-[1.4] overflow-hidden bg-slate-100"
                >
                  {service.image ? (
                    <Image
                      src={service.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                    />
                  ) : (
                    <span className="grid size-full place-items-center text-sm text-slate-400">
                      Service photo
                    </span>
                  )}
                </Link>

                <div className="p-4 sm:p-5">
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
                    <Clock3 className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                    {service.estimatedDuration}
                  </p>

                  <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
                    <div>
                      <p className="text-[10px] font-medium tracking-[0.12em] text-slate-500 uppercase">
                        Starting at
                      </p>
                      <p className="mt-0.5 text-lg font-bold text-slate-900">
                        ৳{service.basePrice.toLocaleString("en-BD", { maximumFractionDigits: 0 })}
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
          <p role="status" className="text-sm text-slate-600">
            No approved services are available yet.
          </p>
        )}

        <Link
          href="/services"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 sm:hidden"
        >
          View all services
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
