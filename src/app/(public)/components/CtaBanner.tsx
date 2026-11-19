import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CtaBanner() {
  return (
    <section className="bg-[#eef4fb] pt-14 pb-8 lg:pt-20 lg:pb-10">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-2xl bg-[linear-gradient(107deg,#2b62d4_0%,#1b4099_32%,#0b1b36_70%,#081428_100%)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_140%_at_10%_15%,rgba(120,174,255,0.28),transparent_55%)]"
          />
          <div className="relative px-8 py-10 sm:px-12 sm:py-12">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-[#9cc2ff] uppercase">
              Ready when you are
            </p>
            <h2 className="mt-4 max-w-[70%] text-[36px] leading-[1.2] font-semibold tracking-[-0.01em] text-white">
              Book a repair today and pay securely
              <br className="hidden sm:block" /> at checkout
            </h2>
            <p className="mt-4 max-w-[65%] text-[18px] leading-relaxed text-slate-300">
              Browse approved repair services, confirm your booking with a card
              payment, and follow every step until the job is complete.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/services"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 gap-2.5 rounded-full bg-white px-6 text-[18px] text-slate-900 hover:bg-slate-100"
                )}
              >
                Browse services
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 rounded-full border-white/25 bg-transparent px-6 text-[18px] font-medium text-white hover:bg-white/10 hover:text-white dark:border-white/25 dark:bg-transparent dark:hover:bg-white/10"
                )}
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
