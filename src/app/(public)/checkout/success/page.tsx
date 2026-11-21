import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { headers } from "next/headers";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import { redirect } from "next/navigation";

import { verifyCheckoutSession } from "@/lib/payments";
import { getCurrentSession } from "@/lib/session";
import { getBetterAuthJwt } from "@/lib/server-jwt";

async function SuccessContent({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  await connection();
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    return (
      <Notice title="Payment reference is missing" description="Open the receipt link from Stripe and try again." />
    );
  }

  const session = await getCurrentSession();
  if (!session) {
    redirect(`/sign-in?next=${encodeURIComponent(`/payment/success?session_id=${sessionId}`)}`);
  }

  let result;
  try {
    const jwt = await getBetterAuthJwt(await headers());
    result = await verifyCheckoutSession(sessionId, {
      id: session.user.id,
      email: session.user.email,
    }, jwt);
  } catch (error) {
    console.error("Could not verify checkout:", error);
    return (
      <Notice title="Payment could not be confirmed" description="Reload this page after Stripe finishes processing. No duplicate payment will be recorded." />
    );
  }

  if (result.status !== "paid") {
    return (
      <Notice title="Payment is still processing" description="Your card may be processing. Reload this page in a moment." />
    );
  }

  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-2xl font-semibold text-slate-900">Payment successful</h1>
      <p className="mt-2 text-sm text-slate-500">
        Your repair payment of ৳{Number(result.payment.amount ?? 0).toLocaleString("en-BD")} is saved.
      </p>
      {result.payment.transactionId ? (
        <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-600">
          Transaction: {result.payment.transactionId}
        </p>
      ) : null}
      <Link href="/customer/bookings" className="mt-6 inline-flex h-10 items-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white">
        Back to my bookings
      </Link>
    </section>
  );
}

function Notice({ title, description }: { title: string; description: string }) {
  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-amber-50 text-amber-600">
        <TriangleAlert className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
      <Link href="/customer/bookings" className="mt-6 inline-flex h-10 items-center rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-700">
        Check my bookings
      </Link>
    </section>
  );
}

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  return (
    <main className="min-h-[65vh] bg-[#f6f9fc] px-4 py-10">
      <div className="container mx-auto">
        <Suspense fallback={
          <div className="mx-auto h-64 max-w-xl animate-pulse rounded-2xl bg-white" role="status" aria-label="Confirming payment" />
        }>
          <SuccessContent searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
