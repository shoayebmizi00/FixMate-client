import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  Star,
  StarHalf,
  Wrench,
} from "lucide-react";

import { fetchTechnicians, type Technician } from "@/lib/technicians";

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
              className="size-[15px] fill-amber-400 text-amber-400"
            />
          );
        }

        if (index === fullStars && hasHalfStar) {
          return (
            <StarHalf
              key={index}
              className="size-[15px] fill-amber-400 text-amber-400"
            />
          );
        }

        return <Star key={index} className="size-[15px] text-slate-300" />;
      })}
    </span>
  );
}

function TechnicianCard({ technician }: { technician: Technician }) {
  const hasRating =
    typeof technician.rating === "number" &&
    typeof technician.reviewCount === "number";

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-shadow hover:shadow-md sm:p-6">
      <div className="flex items-center gap-3.5">
        <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-[15px] font-semibold text-blue-700">
          {technician.image ? (
            <Image
              src={technician.image}
              alt=""
              width={56}
              height={56}
              unoptimized
              className="size-full object-cover"
            />
          ) : (
            getInitials(technician.name)
          )}
        </span>

        <div className="min-w-0">
          <h2 className="flex items-center gap-1.5 text-[17px] leading-tight font-semibold text-slate-900">
            <span className="truncate">{technician.name}</span>
            <BadgeCheck
              className="size-4 shrink-0 text-blue-600"
              aria-label="Verified technician"
            />
          </h2>

          {technician.area ? (
            <p className="mt-1.5 flex items-center gap-1 text-[13px] text-slate-600">
              <MapPin className="size-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              {technician.area}
            </p>
          ) : null}
        </div>
      </div>

      {hasRating ? (
        <div className="mt-4 flex items-center gap-2">
          <Stars rating={technician.rating as number} />
          <span className="text-[13px] font-semibold text-slate-900">
            {(technician.rating as number).toFixed(1)}
          </span>
          <span className="text-[13px] text-slate-500">
            ({technician.reviewCount}{" "}
            {technician.reviewCount === 1 ? "review" : "reviews"})
          </span>
        </div>
      ) : null}

      <div className="flex-1">
        {technician.skills.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {technician.skills.map((skill) => (
              <li
                key={skill}
                className="rounded-full bg-slate-100 px-3 py-1 text-[12.5px] text-slate-700"
              >
                {skill}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-[12.5px] text-slate-500">
            Specialties coming soon.
          </p>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-[12.5px] text-slate-500">
          {technician.repairs}{" "}
          {technician.repairs === 1 ? "repair" : "repairs"} published
        </p>
        <Link
          href={`/technicians/${technician.id}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          View profile
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

async function TechnicianList() {
  // Outside the try/catch on purpose: during prerendering `connection()`
  // rejects to abort the render, and catching that would bake the error
  // fallback into the static shell.
  await connection();

  let technicians: Technician[];

  try {
    technicians = await fetchTechnicians();
  } catch (error) {
    console.error("Could not load technicians:", error);
    return (
      <p
        role="alert"
        className="rounded-2xl border border-rose-200 bg-white p-6 text-sm text-rose-700"
      >
        Technicians are temporarily unavailable. Please try again later.
      </p>
    );
  }

  if (technicians.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Wrench className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">
          No technicians yet
        </h2>
        <p className="mx-auto mt-2 max-w-[420px] text-sm leading-relaxed text-slate-600">
          Technicians who create an account with the technician role will show
          up here once they are approved.
        </p>
        <Link
          href="/sign-up"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          Join as a technician
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {technicians.map((technician) => (
        <TechnicianCard key={technician.id} technician={technician} />
      ))}
    </div>
  );
}

function TechnicianListSkeleton() {
  return (
    <div
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Loading technicians"
    >
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="h-[236px] animate-pulse rounded-2xl border border-slate-200 bg-white"
        />
      ))}
    </div>
  );
}

export default function TechniciansPage() {
  return (
    <main className="min-h-[65vh] bg-[#f6f9fc] px-4 py-10 font-[family-name:var(--font-geist-sans)] sm:px-6 sm:py-12 lg:px-8">
      <div className="container mx-auto">
        <header className="max-w-[640px]">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-blue-600 uppercase">
            Our technicians
          </p>
          <h1 className="mt-3 text-[32px] leading-[1.1] font-bold tracking-[-0.02em] text-slate-900 sm:text-[40px] lg:text-[44px]">
            Meet the people behind the repairs
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-600 sm:text-base">
            Every technician is approved by FixMate before their repairs go
            live. Open a profile to see certifications, specialities and
            ratings from completed jobs.
          </p>
        </header>

        <div className="mt-10">
          <Suspense fallback={<TechnicianListSkeleton />}>
            <TechnicianList />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
