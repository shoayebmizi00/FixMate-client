"use client";

import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-[65vh] place-items-center bg-[#f6f9fc] px-4 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-rose-200 bg-white p-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Something went wrong</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          {error.message || "FixMate could not finish this request. Please try again."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="h-10 rounded-full bg-blue-600 px-5 text-sm font-semibold text-white">
            Try again
          </button>
          <Link href="/" className="h-10 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
