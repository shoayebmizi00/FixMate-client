import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  MapPin,
  Wallet,
  Wrench,
} from "lucide-react";

import {
  fetchAllBookings,
  fetchAllServices,
  type Booking,
  type DashboardService,
} from "@/lib/dashboard-data";
import { requireRole } from "@/lib/session";
import {
  ApprovalBadge,
  PaymentBadge,
  StatusBadge,
  formatDate,
  formatMoney,
  normalizeStatus,
} from "../../../components/dashboard-ui";
import ServiceActions from "./ServiceActions";

function SummaryCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
          {label}
        </p>
        <span
          className={`flex size-10 items-center justify-center rounded-lg ${tone}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-[26px] leading-none font-bold text-slate-900">
        {value}
      </p>
    </article>
  );
}

function customerName(booking: Booking) {
  return booking.customerName ?? booking.customer?.name ?? "Customer";
}

function customerEmail(booking: Booking) {
  return booking.customerEmail ?? booking.customer?.email ?? "";
}

async function ServiceDetailsContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("technician");
  const { id } = await params;

  let services: DashboardService[] = [];
  let bookings: Booking[] = [];

  try {
    [services, bookings] = await Promise.all([
      fetchAllServices(),
      fetchAllBookings(),
    ]);
  } catch (error) {
    console.error("Could not load the service details:", error);

    return (
      <p
        role="alert"
        className="rounded-xl border border-rose-200 bg-white p-5 text-sm text-rose-700"
      >
        This service is temporarily unavailable. Please try again later.
      </p>
    );
  }

  const service = services.find((item) => item._id === id);

  // A technician may only open a service that belongs to their own account.
  if (!service || service.technicianId !== session.user.id) {
    redirect("/technician/services");
  }

  const serviceBookings = bookings
    .filter((booking) => booking.serviceId === service._id)
    .sort(
      (first, second) =>
        new Date(second.createdAt ?? 0).getTime() -
        new Date(first.createdAt ?? 0).getTime()
    );

  const paidBookings = serviceBookings.filter(
    (booking) => normalizeStatus(booking.paymentStatus) === "paid"
  );
  const paidRevenue = paidBookings.reduce(
    (total, booking) => total + (booking.amount ?? 0),
    0
  );
  const pendingRequests = serviceBookings.filter(
    (booking) => normalizeStatus(booking.status) === "requested"
  ).length;

  const approved = normalizeStatus(service.approvalStatus) === "approved";
  const mode = service.serviceMode ?? service.serviceType ?? service.mode ?? "";

  return (
    <div className="space-y-5">
      <Link
        href="/technician/services"
        className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to my services
      </Link>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          <div className="relative aspect-[1.6] overflow-hidden rounded-xl bg-slate-100">
            {service.thumbnail ? (
              <Image
                src={service.thumbnail}
                alt=""
                fill
                sizes="(min-width: 768px) 280px, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="grid size-full place-items-center text-slate-400">
                <Wrench className="size-8" aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <ApprovalBadge status={service.approvalStatus} />
              <span
                className={
                  service.isActive === false
                    ? "text-[12px] font-medium text-amber-600"
                    : "text-[12px] font-medium text-emerald-600"
                }
              >
                {service.isActive === false
                  ? "Hidden from catalogue"
                  : "Visible in catalogue"}
              </span>
            </div>

            <h1 className="mt-3 text-[26px] leading-tight font-bold tracking-tight text-slate-900">
              {service.title}
            </h1>

            <p className="mt-1 text-[13.5px] text-slate-500">
              {service.category ?? "Service"} · {formatMoney(service.price)}
            </p>

            <div className="mt-4 flex flex-wrap gap-4 text-[13px] text-slate-600">
              {service.location ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 text-slate-400" aria-hidden="true" />
                  {service.location}
                </span>
              ) : null}

              {mode ? (
                <span className="inline-flex items-center gap-1.5">
                  <Wrench className="size-4 text-slate-400" aria-hidden="true" />
                  {mode}
                </span>
              ) : null}

              {service.estimatedDuration ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-4 text-slate-400" aria-hidden="true" />
                  {service.estimatedDuration}
                </span>
              ) : null}
            </div>

            <p className="mt-5 text-[13.5px] leading-relaxed whitespace-pre-line text-slate-600">
              {service.description || "No description has been added yet."}
            </p>

            <p className="mt-4 text-[12px] text-slate-400">
              Added {formatDate(service.createdAt)}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {approved ? (
                <Link
                  href={`/services/${service._id}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 text-[12.5px] font-semibold text-slate-800 transition-colors hover:bg-slate-50"
                >
                  View public listing
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
              ) : null}

              <Link
                href="/technician/bookings"
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-blue-600 px-4 text-[12.5px] font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Manage bookings
              </Link>
            </div>
            <ServiceActions
              serviceId={service._id}
              isAvailable={service.isAvailable}
            />

            {!approved ? (
              <p className="mt-4 rounded-lg bg-amber-50 px-3.5 py-3 text-[12.5px] leading-relaxed text-amber-800">
                This listing is waiting for admin approval. Customers can book it
                once it is approved and active.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total bookings"
          value={serviceBookings.length}
          icon={<ClipboardList className="size-5" aria-hidden="true" />}
          tone="bg-blue-50 text-blue-600"
        />
        <SummaryCard
          label="Paid revenue"
          value={formatMoney(paidRevenue)}
          icon={<CircleDollarSign className="size-5" aria-hidden="true" />}
          tone="bg-emerald-50 text-emerald-600"
        />
        <SummaryCard
          label="New requests"
          value={pendingRequests}
          icon={<Wallet className="size-5" aria-hidden="true" />}
          tone="bg-amber-50 text-amber-500"
        />
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-[15px] font-semibold text-slate-900">
            Bookings for this service
          </h2>
          <p className="mt-1 text-[12.5px] text-slate-500">
            Every customer who booked this listing appears here.
          </p>
        </div>

        {serviceBookings.length === 0 ? (
          <p className="px-5 py-10 text-center text-[13px] text-slate-500">
            No bookings for this service yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold tracking-[0.06em] text-slate-500 uppercase">
                  <th className="px-5 py-3.5 font-semibold">Customer</th>
                  <th className="px-5 py-3.5 font-semibold">Preferred date</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Payment</th>
                  <th className="px-5 py-3.5 text-right font-semibold">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {serviceBookings.map((booking) => {
                  const email = customerEmail(booking);

                  return (
                    <tr
                      key={booking._id}
                      className="text-[13.5px] text-slate-600"
                    >
                      <td className="px-5 py-5">
                        <p className="font-semibold text-slate-900">
                          {customerName(booking)}
                        </p>
                        {email ? (
                          <p className="mt-0.5 text-[12px] text-slate-500">
                            {email}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-5 py-5">
                        {formatDate(booking.preferredDate)}
                      </td>
                      <td className="px-5 py-5">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-5 py-5">
                        <PaymentBadge status={booking.paymentStatus} />
                      </td>
                      <td className="px-5 py-5 text-right font-semibold text-slate-900">
                        {formatMoney(booking.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function ServiceDetailsSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading service">
      <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
      <div className="h-72 animate-pulse rounded-xl bg-white" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-xl bg-white" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-white" />
    </div>
  );
}

export default function TechnicianServiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<ServiceDetailsSkeleton />}>
      <ServiceDetailsContent params={params} />
    </Suspense>
  );
}
