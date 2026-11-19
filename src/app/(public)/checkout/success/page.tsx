import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import {
  CheckCircle2,
  Clock3,
  ReceiptText,
  TriangleAlert,
} from "lucide-react";

import { stripe } from "@/lib/stripe";

type FinishedPayment = {
  status: "paid" | "processing";
  amount: number;
  serviceTitle: string;
  preferredDate: string;
  reference: string;
  customerEmail: string;
};

async function apiFetch(path: string, init?: RequestInit): Promise<unknown> {
  const baseUrl = process.env.BASE_API_URL;

  if (!baseUrl) throw new Error("BASE_API_URL is not configured.");

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
    cache: "no-store",
    ...init,
  });

  if (!response.ok) {
    throw new Error(`${path} request failed: ${response.status}`);
  }

  return response.json();
}

function formatPrice(price: number) {
  return `৳${price.toLocaleString("en-BD")}`;
}

async function createBookingIfNeeded(sessionId: string) {
  const checkout = await stripe.checkout.sessions.retrieve(sessionId);

  if (checkout.payment_status !== "paid") {
    return {
      status: "processing" as const,
      amount: 0,
      serviceTitle: "",
      preferredDate: "",
      reference: "",
      customerEmail: "",
    };
  }

  const meta = checkout.metadata ?? {};
  const amount = (checkout.amount_total ?? 0) / 100;
  const reference = `STRIPE-${checkout.id.slice(-12).toUpperCase()}`;
  const createdAt = new Date().toISOString();

  // The success page can be reloaded, so first check whether this Stripe
  // session already created a booking.
  const bookings = (await apiFetch("/bookings")) as Array<{
    _id: string;
    stripeSessionId?: string;
  }>;
  let bookingId = bookings.find(
    (booking) => booking.stripeSessionId === checkout.id
  )?._id;

  if (!bookingId) {
    const created = (await apiFetch("/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId: meta.serviceId,
        serviceTitle: meta.serviceTitle,
        customerId: meta.customerId,
        customerName: meta.customerName,
        customerEmail: meta.customerEmail,
        customerPhone: meta.customerPhone,
        customerAddress: meta.customerAddress,
        technicianId: meta.technicianId,
        preferredDate: meta.preferredDate,
        notes: meta.notes,
        status: "requested",
        paymentStatus: "paid",
        amount,
        stripeSessionId: checkout.id,
        createdAt,
      }),
    })) as { insertedId: string };

    bookingId = created.insertedId;
  }

  const transactions = (await apiFetch("/transactions")) as Array<{
    reference?: string;
  }>;
  const transactionExists = transactions.some(
    (transaction) => transaction.reference === reference
  );

  if (!transactionExists) {
    await apiFetch("/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId,
        customerId: meta.customerId,
        customerName: meta.customerName,
        technicianName: "",
        amount,
        status: "verified",
        method: "Card",
        reference,
        stripeSessionId: checkout.id,
        createdAt,
      }),
    });
  }

  return {
    status: "paid" as const,
    amount,
    serviceTitle: meta.serviceTitle || "Your repair",
    preferredDate: meta.preferredDate || "",
    reference,
    customerEmail:
      checkout.customer_details?.email ?? meta.customerEmail ?? "",
  };
}

function Notice({
  tone,
  title,
  description,
  action,
}: {
  tone: "error" | "processing";
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {
  const Icon = tone === "error" ? TriangleAlert : Clock3;

  return (
    <section className="mx-auto rounded-2xl border border-slate-200 bg-white p-8 text-center sm:p-12">
      <span
        className={`mx-auto grid size-14 place-items-center rounded-full ${
          tone === "error"
            ? "bg-rose-50 text-rose-600"
            : "bg-amber-50 text-amber-600"
        }`}
      >
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-xl font-semibold text-slate-900">{title}</h1>
      <p className="mx-auto mt-2 max-w-[460px] text-sm leading-relaxed text-slate-500">
        {description}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {action ? (
          <Link
            href={action.href}
            className="inline-flex h-10 items-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {action.label}
          </Link>
        ) : null}
        <Link
          href="/services"
          className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Browse services
        </Link>
      </div>
    </section>
  );
}

async function SuccessContent({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  await connection();

  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    return (
      <Notice
        tone="error"
        title="Payment reference is missing"
        description="Open the link from your Stripe receipt, or check your bookings to see the payment."
        action={{ label: "Go to my bookings", href: "/customer" }}
      />
    );
  }

  let payment: FinishedPayment;

  try {
    payment = await createBookingIfNeeded(sessionId);
  } catch (error) {
    console.error("Could not finish the Stripe booking:", error);

    return (
      <Notice
        tone="error"
        title="We could not confirm the booking yet"
        description="Your card payment may still have succeeded. Reload this page to try saving the booking again, or check your bookings in a minute."
        action={{ label: "Try again", href: `/checkout/success?session_id=${sessionId}` }}
      />
    );
  }

  if (payment.status === "processing") {
    return (
      <Notice
        tone="processing"
        title="Payment is still processing"
        description="Stripe has not confirmed the card payment yet. Reload this page in a moment and the booking will be created automatically."
        action={{ label: "Check again", href: `/checkout/success?session_id=${sessionId}` }}
      />
    );
  }

  return (
    <section className="mx-auto rounded-2xl border border-slate-200 bg-white p-8 text-center sm:p-12">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="size-7" aria-hidden="true" />
      </span>

      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
        Payment successful
      </h1>
      <p className="mx-auto mt-2 max-w-[440px] text-sm leading-relaxed text-slate-500">
        {payment.serviceTitle} is booked. The technician will review your
        request and confirm the repair details.
      </p>

      <dl className="mx-auto mt-7 max-w-[420px] space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-5 text-left text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-500">Amount paid</dt>
          <dd className="font-semibold text-slate-900">
            {formatPrice(payment.amount)}
          </dd>
        </div>
        {payment.preferredDate ? (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-slate-500">Preferred date</dt>
            <dd className="font-medium text-slate-900">
              {payment.preferredDate}
            </dd>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-4">
          <dt className="text-slate-500">Reference</dt>
          <dd className="inline-flex items-center gap-1.5 font-medium text-slate-900">
            <ReceiptText className="size-3.5 text-slate-400" aria-hidden="true" />
            {payment.reference}
          </dd>
        </div>
        {payment.customerEmail ? (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-slate-500">Receipt email</dt>
            <dd className="truncate font-medium text-slate-900">
              {payment.customerEmail}
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          href="/customer"
          className="inline-flex h-10 items-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          View my bookings
        </Link>
        <Link
          href="/services"
          className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Browse more services
        </Link>
      </div>
    </section>
  );
}

function SuccessSkeleton() {
  return (
    <div
      className="mx-auto h-80 animate-pulse rounded-2xl bg-white"
      role="status"
      aria-label="Confirming payment"
    />
  );
}

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  return (
    <main className="min-h-[65vh] bg-[#f6f9fc] px-4 py-10 font-[family-name:var(--font-geist-sans)] sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <Suspense fallback={<SuccessSkeleton />}>
          <SuccessContent searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
