import Link from "next/link";
import {
  BadgeCheck,
  ClipboardCheck,
  CreditCard,
  Search,
  ShieldCheck,
  Wrench,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Find a repair",
    description:
      "Browse approved repair services. Search by title or category and choose a home visit or shop drop-off.",
  },
  {
    number: "02",
    icon: ClipboardCheck,
    title: "Send a request",
    description:
      "Sign in as a customer, add your phone, address, preferred date and problem details.",
  },
  {
    number: "03",
    icon: Wrench,
    title: "Technician completes the repair",
    description:
      "The technician accepts or rejects the request, starts the job and sets the final amount when work is complete.",
  },
  {
    number: "04",
    icon: CreditCard,
    title: "Pay after completion",
    description:
      "When the job is completed, open Pay Now and enter card details manually in secure Stripe Checkout.",
  },
];

const roles = [
  {
    icon: Search,
    title: "Customer",
    text: "Find services, send repair requests, track status and pay after the work is done.",
  },
  {
    icon: Wrench,
    title: "Technician",
    text: "Add services, manage repair requests and update every job stage.",
  },
  {
    icon: ShieldCheck,
    title: "Admin",
    text: "Approve service listings, manage roles and monitor bookings and payments.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-[65vh] bg-[#f6f9fc] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="container mx-auto">
        <header className="max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-blue-600 uppercase">
            How FixMate works
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            From request to repair in four clear steps
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            FixMate keeps customers, technicians and administrators informed
            from the first repair request until payment.
          </p>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <article
                key={step.number}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">
                    {step.number}
                  </span>
                  <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                </div>
                <h2 className="mt-6 text-base font-semibold text-slate-900">
                  {step.title}
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                  {step.description}
                </p>
              </article>
            );
          })}
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <BadgeCheck className="size-5 text-blue-600" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-slate-900">
              Three roles, one repair journey
            </h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {roles.map((role) => {
              const Icon = role.icon;

              return (
                <div
                  key={role.title}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-5"
                >
                  <Icon className="size-5 text-slate-700" aria-hidden="true" />
                  <h3 className="mt-3 text-sm font-semibold text-slate-900">
                    {role.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                    {role.text}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/services"
            className="inline-flex h-11 items-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Browse services
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-11 items-center rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Create an account
          </Link>
        </div>
      </div>
    </main>
  );
}
