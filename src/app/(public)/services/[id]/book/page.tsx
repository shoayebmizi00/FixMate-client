import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, Clock3, Lock, MapPin, ShieldCheck } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { dashboardPathForRole } from "@/lib/dashboard";
import { fetchApprovedServices, type Service } from "@/lib/services";
import { getCurrentSession } from "@/lib/session";

import BookingForm from "./BookingForm";

function formatPrice(price: number) {
  return `৳${price.toLocaleString("en-BD")}`;
}

async function BookingContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getCurrentSession();

  // Send signed-out visitors to sign in, then bring them straight back here.
  if (!session) {
    redirect(`/signin?next=${encodeURIComponent(`/services/${id}/book`)}`);
  }

  const role = session.user.role ?? "customer";

  if (role !== "customer") {
    redirect(dashboardPathForRole(role));
  }

  let services: Service[];

  try {
    services = await fetchApprovedServices();
  } catch (error) {
    console.error("Could not load the booking page:", error);

    return (
      <p
        role="alert"
        className="rounded-2xl border border-rose-200 bg-white p-6 text-sm text-rose-700"
      >
        This service is temporarily unavailable. Please try again later.
      </p>
    );
  }

  const service = services.find((item) => item._id === id || item.slug === id);

  if (!service) notFound();

  const serviceMode =
    service.serviceMode ?? service.serviceType ?? service.mode ?? "Home visit";

  return (
    <div className="space-y-5">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-xs text-slate-500"
      >
        <Link href="/services" className="transition hover:text-blue-700">
          Services
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href={`/services/${service._id}`}
          className="truncate transition hover:text-blue-700"
        >
          {service.title}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-slate-700">Book</span>
      </nav>

      <div className="grid gap-5 md:grid-cols-[1.25fr_0.9fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Confirm your booking
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
            Add the repair address and preferred date. Payment is handled
            securely by Stripe before the booking is sent to the technician.
          </p>

          <BookingForm
            serviceId={service._id}
            serviceTitle={service.title}
            price={service.price}
            customer={{
              name: session.user.name,
              email: session.user.email,
              phone: session.user.phone ?? "",
            }}
            testMode={process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ?? false}
          />
        </section>

        <aside className="space-y-4 self-start md:sticky md:top-24">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="relative aspect-[1.6] bg-slate-200">
              {service.thumbnail ? (
                <Image
                  src={service.thumbnail}
                  alt={`${service.title} repair`}
                  fill
                  sizes="(min-width: 768px) 38vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <span className="grid size-full place-items-center text-sm text-slate-500">
                  Repair service
                </span>
              )}
            </div>

            <div className="p-5">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                {service.category}
              </p>
              <h2 className="mt-1 text-base font-semibold text-slate-900">
                {service.title}
              </h2>

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
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5" aria-hidden="true" />
                  {serviceMode}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-sm text-slate-600">Total due today</span>
                <span className="text-lg font-bold text-slate-900">
                  {formatPrice(service.price)}
                </span>
              </div>

              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                You pay the starting price now to confirm the booking. Any
                difference is settled with the technician after the repair.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Lock className="size-4 text-emerald-600" aria-hidden="true" />
              Secure card payment
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              You will be redirected to Stripe&apos;s secure checkout page. A
              receipt is saved with your transaction once the payment succeeds.
            </p>
          </section>
        </aside>
      </div>

      <Link
        href={`/services/${service._id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 transition hover:text-blue-800"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to service details
      </Link>
    </div>
  );
}

function BookingSkeleton() {
  return (
    <div
      className="grid gap-5 md:grid-cols-[1.25fr_0.9fr]"
      role="status"
      aria-label="Loading booking page"
    >
      <div className="h-[480px] animate-pulse rounded-2xl bg-white" />
      <div className="h-80 animate-pulse rounded-2xl bg-white" />
    </div>
  );
}

export default function BookServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="min-h-[65vh] bg-[#f6f9fc] px-4 py-8 font-[family-name:var(--font-geist-sans)] sm:px-6 sm:py-10 lg:px-8">
      <div className="container mx-auto">
        <Suspense fallback={<BookingSkeleton />}>
          <BookingContent params={params} />
        </Suspense>
      </div>
    </main>
  );
}
