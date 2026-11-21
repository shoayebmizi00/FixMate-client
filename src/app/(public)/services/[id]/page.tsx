import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import {
  ArrowLeft,
  BadgeCheck,
  BadgeDollarSign,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  MessageCircle,
  Shield,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { fetchApprovedServices, type Service } from "@/lib/services";
import { fetchTechnicians, type Technician } from "@/lib/technicians";
import { getCurrentSession } from "@/lib/session";

function formatPrice(price: number) {
  return `৳${price.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
}

function ServiceDetail({
  service,
  technician,
  relatedServices,
}: {
  service: Service;
  technician?: Technician;
  relatedServices: Service[];
}) {
  const serviceMode = service.serviceMode || "At your location";

  return (
    <main className="min-h-[65vh] bg-white font-[family-name:var(--font-geist-sans)]">
      <div className="border-b border-slate-100 bg-slate-50/70">
        <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/services" className="font-medium transition hover:text-blue-700">
              Services
            </Link>
            <ChevronRight className="size-3.5" aria-hidden="true" />
            <span className="max-w-[220px] truncate font-medium text-slate-800 sm:max-w-md">
              {service.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1.7fr)_380px]">
          <div className="relative min-h-[360px] overflow-hidden rounded-[28px] bg-slate-900 sm:min-h-[440px] lg:min-h-[500px]">
            {service.image ? (
              <Image
                src={service.image}
                alt={`${service.title} repair`}
                fill
                priority
                sizes="(min-width: 1024px) 68vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="grid size-full place-items-center text-sm text-slate-300">
                <Wrench className="mr-2 size-5" aria-hidden="true" />
                Repair service
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/5" />
            <div className="absolute left-5 top-5 flex flex-wrap gap-2 sm:left-7 sm:top-7">
              <span className="rounded-full border border-white/20 bg-slate-950/45 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                {service.category}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-950/20">
                <BadgeCheck className="size-3.5" aria-hidden="true" />
                FixMate approved
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8 lg:p-10">
              <p className="mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-blue-200 uppercase">
                <ShieldCheck className="size-4" aria-hidden="true" />
                Professional home service
              </p>
              <h1 className="text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl lg:text-[56px]">
                {service.title}
              </h1>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-200">
                <span className="flex items-center gap-2">
                  <Clock3 className="size-4" aria-hidden="true" />
                  {service.estimatedDuration || "Duration confirmed by technician"}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="size-4" aria-hidden="true" />
                  {service.serviceArea || "Available in your area"}
                </span>
              </div>
            </div>
          </div>

          <aside className="flex flex-col rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.10)] lg:sticky lg:top-24 lg:max-h-[calc(100vh-120px)]">
            <p className="text-xs font-bold tracking-[0.14em] text-slate-500 uppercase">
              Book this service
            </p>
            <div className="mt-4 flex items-end justify-between border-b border-slate-100 pb-5">
              <div>
                <p className="text-sm text-slate-500">Starting from</p>
                <p className="mt-1 text-4xl font-bold tracking-tight text-slate-950">
                  {formatPrice(service.basePrice)}
                </p>
              </div>
              <BadgeDollarSign className="size-8 text-blue-600" aria-hidden="true" />
            </div>

            <div className="mt-5 space-y-3">
              {[
                { icon: ShieldCheck, label: "Verified provider", text: "Identity and profile reviewed" },
                { icon: CalendarDays, label: "Flexible scheduling", text: "Choose your preferred date" },
                { icon: BadgeDollarSign, label: "Pay after repair", text: "No upfront service payment" },
              ].map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div key={benefit.label} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-blue-700 shadow-sm">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{benefit.label}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{benefit.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              href={`/services/${service._id}/book`}
              className="mt-5 flex h-14 items-center justify-center rounded-xl bg-blue-600 px-5 text-[15px] font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Request this service
              <ChevronRight className="ml-2 size-4" aria-hidden="true" />
            </Link>
            <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">
              You will confirm your address and visit details before sending the request.
            </p>

            {technician ? (
              <Link
                href={`/technicians/${technician.id}`}
                className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5"
              >
                <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-slate-100">
                  {technician.image ? (
                    <Image src={technician.image} alt={technician.name} fill unoptimized sizes="44px" className="object-cover" />
                  ) : (
                    <Shield className="absolute left-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-blue-700" aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">{technician.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {technician.repairs > 0 ? `${technician.repairs} active listing${technician.repairs === 1 ? "" : "s"}` : "FixMate technician"}
                  </p>
                </div>
                <ChevronRight className="size-4 text-slate-400" aria-hidden="true" />
              </Link>
            ) : null}
          </aside>
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_380px]">
          <div className="space-y-8">
            <section>
              <p className="text-xs font-bold tracking-[0.16em] text-blue-600 uppercase">Service overview</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                About this service
              </h2>
              <p className="mt-4 text-[15px] leading-8 text-slate-600 sm:text-base">
                {service.description}
              </p>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-slate-50/60 p-5 sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold tracking-[0.16em] text-blue-600 uppercase">Easy booking</p>
                  <h2 className="mt-2 text-xl font-bold text-slate-950 sm:text-2xl">How the repair works</h2>
                </div>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {[
                  { icon: MessageCircle, title: "Send a request", text: "Tell us where and when you need help." },
                  { icon: Users, title: "Meet your technician", text: "The provider confirms and inspects the issue." },
                  { icon: CheckCircle2, title: "Approve the completion", text: "Track the repair and payment from your dashboard." },
                ].map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                      <div className="flex items-center justify-between">
                        <span className="grid size-11 place-items-center rounded-2xl bg-blue-50 text-blue-700">
                          <Icon className="size-5" aria-hidden="true" />
                        </span>
                        <span className="text-sm font-bold text-slate-300">0{index + 1}</span>
                      </div>
                      <p className="mt-4 font-bold text-slate-950">{step.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">{step.text}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-[24px] bg-[#0b1f4b] p-6 text-white">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-white/10 text-blue-200">
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-bold">FixMate protected</p>
                  <p className="mt-0.5 text-xs text-blue-100/75">Approved listing and tracked service</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
                <div>
                  <p className="text-[11px] text-blue-100/60">Service mode</p>
                  <p className="mt-1 text-sm font-bold">{serviceMode}</p>
                </div>
                <div>
                  <p className="text-[11px] text-blue-100/60">Availability</p>
                  <p className="mt-1 text-sm font-bold">{service.isAvailable ? "Available" : "Limited"}</p>
                </div>
              </div>
            </section>

            {technician?.bio ? (
              <section className="rounded-[24px] border border-slate-200 p-6">
                <p className="text-xs font-bold tracking-[0.14em] text-slate-500 uppercase">Provider note</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{technician.bio}</p>
              </section>
            ) : null}
          </aside>
        </div>

        {relatedServices.length ? (
          <section className="mt-12 border-t border-slate-100 pt-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-blue-600 uppercase">You may also need</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Related services</h2>
              </div>
              <Link href="/services" className="hidden items-center gap-1 text-sm font-bold text-blue-700 sm:flex">
                View all <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedServices.map((item) => (
                <Link
                  key={item._id}
                  href={`/services/${item._id}`}
                  className="group overflow-hidden rounded-[22px] border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                >
                  <div className="relative aspect-[16/9] bg-slate-100">
                    {item.image ? (
                      <Image src={item.image} alt={item.title} fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
                    ) : (
                      <Wrench className="absolute left-1/2 top-1/2 size-7 -translate-x-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-bold text-blue-600">{item.category}</p>
                    <h3 className="mt-1 font-bold text-slate-950">{item.title}</h3>
                    <p className="mt-3 text-sm font-bold text-slate-800">From {formatPrice(item.basePrice)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <Link
          href="/services"
          className="mt-10 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:text-blue-700"
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
      className="min-h-[65vh] bg-white"
      aria-label="Loading service"
      role="status"
    >
      <div className="border-b border-slate-100 bg-slate-50/70">
        <div className="container mx-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_380px]">
          <div className="min-h-[360px] animate-pulse rounded-[28px] bg-slate-200 sm:min-h-[440px] lg:min-h-[500px]" />
          <div className="h-[500px] animate-pulse rounded-[28px] bg-slate-200" />
        </div>
      </div>
    </main>
  );
}

async function ServiceDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const { id } = await params;
  let services: Service[];
  let technicians: Technician[] = [];

  try {
    services = await fetchApprovedServices();
    technicians = await fetchTechnicians();
  } catch (error) {
    console.error("Could not load service details:", error);
    return (
      <main className="min-h-[65vh] px-4 py-10 sm:px-6 lg:px-8">
        <div className="container mx-auto">
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
        </div>
      </main>
    );
  }

  const service = services.find(
    (item) => item._id === id || item.slug === id
  );
  if (!service) notFound();
  const technician = technicians.find(
    (item) =>
      item.id === service.technicianId ||
      item.email?.toLowerCase() === service.technicianEmail?.toLowerCase()
  );
  const relatedServices = services
    .filter(
      (item) =>
        item._id !== service._id &&
        item.category.toLowerCase() === service.category.toLowerCase()
    )
    .slice(0, 3);

  return (
    <ServiceDetail
      service={service}
      technician={technician}
      relatedServices={relatedServices}
    />
  );
}

export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentSession();
  if (session?.user.role === "technician") {
    redirect("/technician");
  }

  return (
    <Suspense fallback={<ServiceDetailSkeleton />}>
      <ServiceDetailContent params={params} />
    </Suspense>
  );
}
