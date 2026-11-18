import { CreditCard, FileText, Search, Wrench } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Find a service",
    description:
      "Browse approved services by category, price and service mode, then read the full repair details.",
  },
  {
    number: "02",
    icon: FileText,
    title: "Send a repair request",
    description:
      "Share your address, preferred date and the problem. The technician reviews your request.",
  },
  {
    number: "03",
    icon: Wrench,
    title: "Technician fixes it",
    description:
      "Track the job from accepted to in progress, and see the final amount once the work is done.",
  },
  {
    number: "04",
    icon: CreditCard,
    title: "Pay after completion",
    description:
      "Only after the repair is marked complete do you pay the final amount through secure checkout.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-slate-100 py-16 lg:py-20">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-blue-600 uppercase">
          How FixMate works
        </p>
        <h2 className="mt-3 text-[30px] leading-[1.15] font-semibold tracking-[-0.01em] text-[#0b1524]">
          Four clear steps from broken to fixed
        </h2>
        <p className="mt-3 max-w-[560px] text-[15px] leading-relaxed text-slate-500">
          No phone tag and no guesswork. Every step of the repair is recorded so
          you always know exactly where your job stands.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex flex-col rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
            >
              <span className="font-mono text-[11px] font-medium tracking-wide text-slate-400">
                {step.number}
              </span>
              <step.icon
                className="mt-5 size-[22px] text-blue-600"
                strokeWidth={1.6}
                aria-hidden="true"
              />
              <h3 className="mt-9 text-[15px] font-semibold text-[#0b1524]">
                {step.title}
              </h3>
              <p className="mt-2 text-[13px] leading-[1.6] text-slate-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
