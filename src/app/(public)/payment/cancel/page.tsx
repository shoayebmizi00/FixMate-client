import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <main className="min-h-[65vh] bg-[#f6f9fc] px-4 py-12">
      <div className="container mx-auto">
        <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Payment cancelled</h1>
          <p className="mt-2 text-sm text-slate-500">
            No payment was recorded. Your booking is unchanged.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/customer/bookings" className="h-10 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white">
              Back to my bookings
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
