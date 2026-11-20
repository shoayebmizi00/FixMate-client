import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Home, Wrench } from "lucide-react";

import logo from "@/assets/logo.png";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="relative flex min-h-[70vh] items-center overflow-hidden bg-[#f6f9fc] px-4 py-16 font-[family-name:var(--font-geist-sans)] sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_0%,rgba(37,99,235,0.12),transparent_70%)]"
      />

      <div className="container relative mx-auto">
        <div className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src={logo}
              alt="FixMate logo"
              width={44}
              height={44}
              className="size-11 rounded-xl object-cover ring-1 ring-slate-900/5"
            />
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Fix<span className="text-blue-600">Mate</span>
            </span>
          </Link>

          <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-blue-700 uppercase">
            <Wrench className="size-3.5" aria-hidden="true" />
            Error 404
          </p>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            This page needs a repair.
          </h1>

          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-slate-500">
            The page you are looking for does not exist, was moved, or the link
            is broken.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 gap-2 rounded-full bg-blue-600 px-6 text-white hover:bg-blue-700"
              )}
            >
              <Home className="size-4" aria-hidden="true" />
              Back home
            </Link>

            <Link
              href="/services"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 gap-2 rounded-full border-slate-200 bg-white px-6 text-slate-800 hover:bg-slate-50"
              )}
            >
              Browse services
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <p className="mt-8 text-[12.5px] text-slate-400">
            Looking for a technician?{" "}
            <Link
              href="/technicians"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Meet the pros
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
