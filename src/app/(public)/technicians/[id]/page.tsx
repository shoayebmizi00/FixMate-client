import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  MapPin,
  Star,
  StarHalf,
  Wrench,
} from "lucide-react";

import { fetchTechnicians, type Technician } from "@/lib/technicians";
import { getCurrentSession } from "@/lib/session";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function Stars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  return (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((index) => {
        if (index < fullStars) {
          return (
            <Star
              key={index}
              className="size-4 fill-amber-400 text-amber-400"
            />
          );
        }

        if (index === fullStars && hasHalfStar) {
          return (
            <StarHalf
              key={index}
              className="size-4 fill-amber-400 text-amber-400"
            />
          );
        }

        return <Star key={index} className="size-4 text-slate-300" />;
      })}
    </span>
  );
}

function TechnicianProfile({ technician }: { technician: Technician }) {
  const hasRating =
    typeof technician.rating === "number" &&
    typeof technician.reviewCount === "number";

  return (
    <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-xl font-semibold text-blue-700">
            {technician.image ? (
              <Image
                src={technician.image}
                alt=""
                width={80}
                height={80}
                unoptimized
                className="size-full object-cover"
              />
            ) : (
              getInitials(technician.name)
            )}
          </span>

          <div className="min-w-0">
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
              <span className="truncate">{technician.name}</span>
              <BadgeCheck
                className="size-5 shrink-0 text-blue-600"
                aria-label="Verified technician"
              />
            </h1>

            {technician.area ? (
              <p className="mt-2 flex items-center gap-1 text-sm text-slate-600">
                <MapPin className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
                {technician.area}
              </p>
            ) : null}

            {hasRating ? (
              <div className="mt-2 flex items-center gap-2">
                <Stars rating={technician.rating as number} />
                <span className="text-sm font-semibold text-slate-900">
                  {(technician.rating as number).toFixed(1)}
                </span>
                <span className="text-sm text-slate-500">
                  ({technician.reviewCount}{" "}
                  {technician.reviewCount === 1 ? "review" : "reviews"})
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {technician.skills.length > 0 ? (
          <div className="mt-6 border-t border-slate-100 pt-5">
            <h2 className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
              Specialities
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {technician.skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-full bg-slate-100 px-3 py-1 text-[12.5px] text-slate-700"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-6 flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
          <Wrench className="size-4 shrink-0 text-blue-600" aria-hidden="true" />
          <p className="text-[13px] text-slate-600">
            <span className="font-semibold text-slate-900">
              {technician.repairs}
            </span>{" "}
            {technician.repairs === 1 ? "repair" : "repairs"} published
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <h2 className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
          Published repairs
        </h2>

        {technician.services.length > 0 ? (
          <ul className="mt-4 divide-y divide-slate-100">
            {technician.services.map((service) => (
              <li key={service.id}>
                <Link
                  href={`/services/${service.id}`}
                  className="group flex items-center justify-between gap-3 py-3"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-900 group-hover:text-blue-700">
                      {service.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {service.category}
                    </span>
                  </span>
                  <ArrowRight
                    className="size-4 shrink-0 text-slate-400 group-hover:text-blue-600"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-600">
            This technician has not published a repair yet.
          </p>
        )}
      </section>
    </div>
  );
}

async function TechnicianProfileContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const { id } = await params;

  let technicians: Technician[];

  try {
    technicians = await fetchTechnicians();
  } catch (error) {
    console.error("Could not load technician profile:", error);
    return (
      <p
        role="alert"
        className="rounded-2xl border border-rose-200 bg-white p-6 text-sm text-rose-700"
      >
        This profile is temporarily unavailable. Please try again later.
      </p>
    );
  }

  const technician = technicians.find((item) => item.id === id);
  if (!technician) notFound();

  return <TechnicianProfile technician={technician} />;
}

function TechnicianProfileSkeleton() {
  return (
    <div
      className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]"
      role="status"
      aria-label="Loading technician profile"
    >
      <div className="h-72 animate-pulse rounded-2xl bg-white" />
      <div className="h-72 animate-pulse rounded-2xl bg-white" />
    </div>
  );
}

export default async function TechnicianProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCurrentSession();
  if (session?.user.role === "technician") {
    redirect("/dashboard/technician");
  }

  return (
    <main className="min-h-[65vh] bg-[#f6f9fc] px-4 py-10 font-[family-name:var(--font-geist-sans)] sm:px-6 sm:py-12 lg:px-8">
      <div className="container mx-auto">
        <Link
          href="/technicians"
          className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All technicians
        </Link>

        <Suspense fallback={<TechnicianProfileSkeleton />}>
          <TechnicianProfileContent params={params} />
        </Suspense>
      </div>
    </main>
  );
}
