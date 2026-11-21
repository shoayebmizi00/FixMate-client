import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  CreditCard,
  Wrench,
} from "lucide-react";

const problems = [
  "Finding a technician you can actually trust.",
  "Knowing what repair should cost before booking.",
  "Not having a clear follow-through on a job.",
  "Paying before every step has been completed.",
  "Technicians having no professional place to be found.",
];

const benefits = [
  {
    icon: BadgeCheck,
    title: "Verified work, reviewed listings",
    description:
      "Technicians submit services for approval, and only approved listings reach the public catalogue.",
  },
  {
    icon: ClipboardCheck,
    title: "A record of every step",
    description:
      "Each booking keeps its own timeline, so customers and technicians see the same job status.",
  },
  {
    icon: CreditCard,
    title: "Payment that follows the work",
    description:
      "Nothing is charged upfront. Payment opens only when a technician marks the repair complete.",
  },
];

const roles = [
  {
    title: "Customers",
    description:
      "Browse, request repairs, track progress, cancel while pending, and pay after the technician completes the repair.",
  },
  {
    title: "Technicians",
    description:
      "Publish services, manage availability, accept or reject requests, and complete jobs with a clear amount.",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-[#f6f9fc] font-[family-name:var(--font-geist-sans)] text-slate-900">
      <section className="bg-white py-10 sm:py-14">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 sm:px-6 md:grid-cols-[1.2fr_0.8fr] lg:gap-14 lg:px-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-blue-600 uppercase">
              About FixMate
            </p>
            <h1 className="mt-3 max-w-xl text-4xl leading-[1.08] font-bold tracking-tight text-slate-900 lg:text-5xl">
              Repair service built around trust, not guesswork
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              FixMate is a repair marketplace for smart devices and home
              appliances. Customers find approved repair services, request a
              technician, and follow the job until it is finished. Technicians
              get a professional place to list their work and manage every
              request in one dashboard.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Link
                href="/services"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Browse services
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                Join as a technician
              </Link>
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-[#f3f7fc] p-5 sm:p-6">
            <span className="flex size-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Wrench className="size-4" aria-hidden="true" />
            </span>
            <h2 className="mt-3 text-base font-semibold text-slate-900">
              The problems we solve
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
              {problems.map((problem) => (
                <li key={problem} className="flex items-start gap-2">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 size-1 shrink-0 rounded-full bg-blue-500"
                  />
                  <span>{problem}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-3 sm:grid-cols-3">
            {benefits.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <span className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon className="size-3.5" aria-hidden="true" />
                </span>
                <h2 className="mt-3 text-sm font-semibold text-slate-900">
                  {title}
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                  {description}
                </p>
              </article>
            ))}
          </div>

          <section className="mt-5 grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 md:grid-cols-[0.85fr_1.15fr] md:gap-8">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Built for three roles
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                FixMate keeps each side of the marketplace in its own workspace,
                with the permissions and tools that role needs.
              </p>
            </div>
            <div className="space-y-3">
              {roles.map(({ title, description }) => (
                <div key={title}>
                  <h3 className="text-xs font-semibold text-slate-900">
                    {title}
                  </h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </section>
      <section className="px-4 pt-10 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="relative isolate overflow-hidden rounded-2xl bg-[linear-gradient(107deg,#2b62d4_0%,#1b4099_32%,#0b1b36_70%,#081428_100%)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_140%_at_10%_15%,rgba(120,174,255,0.28),transparent_55%)]"
            />
            <div className="relative px-5 py-6 sm:px-8 sm:py-8">
              <p className="text-xs font-semibold tracking-[0.16em] text-[#9cc2ff] uppercase">
                Ready when you are
              </p>
              <h2 className="mt-2 max-w-[70%] text-2xl leading-tight font-semibold tracking-tight text-white sm:text-3xl">
                Book a repair today
                <br className="hidden sm:block" /> and pay after completion
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
                Browse approved repair services and follow every step until the
                job is complete. Enter card details manually in Stripe to pay.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link
                  href="/services"
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-white px-4 text-xs font-semibold text-slate-900 transition-colors hover:bg-slate-100"
                >
                  Browse services
                  <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex h-9 items-center justify-center rounded-full border border-white/25 bg-transparent px-4 text-xs font-medium text-white transition-colors hover:bg-white/10"
                >
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
