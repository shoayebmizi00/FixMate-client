import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Clock3,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { notFound } from "next/navigation";

import { fetchApprovedServices, type Service } from "@/lib/services";

function formatPrice(price: number) {
  return `৳${price.toLocaleString("en-BD")}`;
}

function ServiceDetail({ service }: { service: Service }) {
  const serviceMode =
    service.serviceMode ?? service.serviceType ?? service.mode;

  return (
    <main className="min-h-[65vh] bg-[#f6f9fc] px-4 py-8 font-[family-name:var(--font-geist-sans)] sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex items-center gap-2 text-xs text-slate-500"
        >
          <Link href="/services" className="transition hover:text-blue-700">
            Services
          </Link>
          <span aria-hidden="true">/</span>
          <span className="truncate text-slate-700">{service.title}</span>
        </nav>

        <div className="grid gap-5 md:grid-cols-[1.25fr_0.9fr]">
          <div className="relative aspect-[1.5] overflow-hidden rounded-2xl bg-slate-200">
            {service.thumbnail ? (
              <Image
                src={service.thumbnail}
                alt={`${service.title} repair`}
                fill
                priority
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="grid size-full place-items-center text-sm text-slate-500">
                Repair service
              </div>
            )}
          </div>

          <section className="flex flex-col justify-center">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-200 px-3 py-1 text-[10px] font-semibold tracking-wide text-slate-600 uppercase">
                {service.category}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold tracking-wide text-emerald-700 uppercase">
                <BadgeCheck className="size-3.5" aria-hidden="true" />
                Approved
              </span>
            </div>

            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-3xl">
              {service.title}
            </h1>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-3.5" aria-hidden="true" />
                {service.estimatedDuration}
              </span>
              {service.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {service.location}
                </span>
              )}
              {serviceMode && (
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5" aria-hidden="true" />
                  {serviceMode}
                </span>
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                Starting price
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {formatPrice(service.price)}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                The final cost is confirmed by the technician after the repair
                is complete.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-[1.25fr_0.9fr]">
          <div className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="text-base font-semibold text-slate-900">
                About this repair
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {service.description}
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="text-base font-semibold text-slate-900">
                What happens next
              </h2>
              <ul className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
                {[
                  "Sign in as a customer and share the issue, address and preferred date.",
                  "The technician reviews the request and confirms the repair details.",
                  "Track the repair progress and pay after the work is complete.",
                ].map((step) => (
                  <li key={step} className="flex items-start gap-2.5">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-emerald-500"
                      aria-hidden="true"
                    />
                    {step}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                Your technician
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-700">
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Verified service provider
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Technician details are shared after they review your request.
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-slate-500">
                This service listing is approved by FixMate. The individual
                technician profile is not included in the available service data.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <Link
                href="/signin"
                className="flex h-11 items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Request this repair
              </Link>
              <p className="mt-2 text-center text-[11px] leading-relaxed text-slate-500">
                Only customer accounts can request a repair. Sign in to continue.
              </p>
            </section>
          </aside>
        </div>

        <Link
          href="/services"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-blue-700 transition hover:text-blue-800"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to all services
        </Link>
      </div>
    </main>
  );
}

function ServiceDetailSkeleton() {
  return (
    <main
      className="mx-auto min-h-[65vh] max-w-5xl space-y-5 px-4 py-10 sm:px-6 lg:px-8"
      aria-label="Loading service"
      role="status"
    >
      <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
      <div className="grid gap-5 md:grid-cols-2">
        <div className="aspect-[1.5] animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </main>
  );
}

async function ServiceDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let services: Service[];

  try {
    services = await fetchApprovedServices();
  } catch (error) {
    console.error("Could not load service details:", error);
    return (
      <main className="mx-auto min-h-[65vh] max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <p
          role="alert"
          className="rounded-2xl border border-rose-200 bg-white p-6 text-sm text-rose-700"
        >
          Service details are temporarily unavailable. Please try again later.
        </p>
        <Link
          href="/services"
          className="mt-5 inline-flex text-sm font-medium text-blue-700 hover:text-blue-800"
        >
          Browse all services
        </Link>
      </main>
    );
  }

  const service = services.find(
    (item) => item._id === id || item.slug === id
  );
  if (!service) notFound();

  return <ServiceDetail service={service} />;
}

export default function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<ServiceDetailSkeleton />}>
      <ServiceDetailContent params={params} />
    </Suspense>
  );
}
