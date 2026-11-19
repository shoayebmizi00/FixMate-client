"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { CreditCard, LoaderCircle, Lock } from "lucide-react";

import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

type Customer = {
  name: string;
  email: string;
  phone?: string;
};

const labelClass = "mb-1.5 block text-[13px] font-medium text-slate-800";
const fieldClass =
  "h-11 rounded-lg border-slate-200 bg-white px-3.5 text-sm text-slate-900";

function formatPrice(price: number) {
  return `৳${price.toLocaleString("en-BD")}`;
}

export default function BookingForm({
  serviceId,
  serviceTitle,
  price,
  customer,
  testMode,
}: {
  serviceId: string;
  serviceTitle: string;
  price: number;
  customer: Customer;
  testMode: boolean;
}) {
  const [fullName, setFullName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone ?? "");
  const [address, setAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!fullName.trim() || !phone.trim() || !address.trim() || !preferredDate) {
      setError("Add your name, phone, address and preferred date to continue.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout_sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          preferredDate,
          notes: notes.trim(),
        }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Could not start the payment.");
      }

      // Stripe Checkout is hosted on Stripe's own page.
      window.location.assign(data.url);
    } catch (checkoutError) {
      const message =
        checkoutError instanceof Error
          ? checkoutError.message
          : "Could not start the payment.";

      setError(message);
      setIsSubmitting(false);

      toast.add({
        title: "Payment could not start",
        description: message,
        type: "error",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="booking-name" className={labelClass}>
            Full name
          </label>
          <Input
            id="booking-name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className={fieldClass}
            placeholder="Name on the booking"
            required
          />
        </div>

        <div>
          <label htmlFor="booking-phone" className={labelClass}>
            Phone
          </label>
          <Input
            id="booking-phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={fieldClass}
            placeholder="Contact number"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="booking-email" className={labelClass}>
          Email
        </label>
        <Input
          id="booking-email"
          value={customer.email}
          readOnly
          className={`${fieldClass} bg-slate-50 text-slate-500`}
        />
      </div>

      <div>
        <label htmlFor="booking-address" className={labelClass}>
          Repair address
        </label>
        <Input
          id="booking-address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          className={fieldClass}
          placeholder="House, road, area and city"
          required
        />
      </div>

      <div>
        <label htmlFor="booking-date" className={labelClass}>
          Preferred date
        </label>
        <Input
          id="booking-date"
          type="date"
          value={preferredDate}
          onChange={(event) => setPreferredDate(event.target.value)}
          className={fieldClass}
          required
        />
      </div>

      <div>
        <label htmlFor="booking-notes" className={labelClass}>
          Notes for the technician <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          id="booking-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          maxLength={400}
          placeholder="Describe the issue, for example: the screen is cracked but still works."
          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400"
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-slate-900">
          <CreditCard className="size-4 text-blue-600" aria-hidden="true" />
          Card payment
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
          You will enter your card on Stripe&apos;s secure page for{" "}
          {formatPrice(price)}.
        </p>

        {testMode ? (
          <p className="mt-2 rounded-md bg-amber-50 px-2.5 py-2 text-[11px] leading-relaxed text-amber-700">
            Test mode: use card 4242 4242 4242 4242, any future expiry date and
            any CVC.
          </p>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-[12.5px] font-medium text-rose-600">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            Opening secure checkout…
          </>
        ) : (
          <>
            <Lock className="size-4" aria-hidden="true" />
            Pay {formatPrice(price)} &amp; book {serviceTitle}
          </>
        )}
      </button>

      <p className="text-center text-[11px] leading-relaxed text-slate-500">
        Payments are processed by Stripe. FixMate never stores your card
        details.
      </p>
    </form>
  );
}
