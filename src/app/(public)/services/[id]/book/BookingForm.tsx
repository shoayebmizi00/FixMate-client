"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, LoaderCircle } from "lucide-react";

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
  return `৳${price.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
}

export default function BookingForm({
  serviceId,
  price,
  customer,
}: {
  serviceId: string;
  serviceTitle: string;
  price: number;
  customer: Customer;
}) {
  const router = useRouter();
  const [phone, setPhone] = useState(customer.phone ?? "");
  const [address, setAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function todayString() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  }

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!phone.trim() || !address.trim() || !preferredDate) {
      setError("Add your phone, address and preferred date to continue.");
      return;
    }

    if (problemDescription.trim().length < 20) {
      setError("Describe the problem in at least 20 characters.");
      return;
    }

    if (preferredDate < todayString()) {
      setError("Choose today or a future date.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          phone: phone.trim(),
          address: address.trim(),
          preferredDate,
          problemDescription: problemDescription.trim(),
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not create the repair request.");
      }

      toast.add({
        title: "Repair request sent",
        description: "The technician can now review your request.",
        type: "success",
      });
      router.push("/dashboard/customer/bookings");
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Could not create the repair request.";
      setError(message);
      toast.add({
        title: "Request could not be sent",
        description: message,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={submitRequest} className="mt-5 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="booking-name" className={labelClass}>Full name</label>
          <Input id="booking-name" value={customer.name} readOnly className={`${fieldClass} bg-slate-50 text-slate-500`} />
        </div>
        <div>
          <label htmlFor="booking-phone" className={labelClass}>Phone</label>
          <Input id="booking-phone" value={phone} onChange={(event) => setPhone(event.target.value)} className={fieldClass} placeholder="Contact number" required />
        </div>
      </div>

      <div>
        <label htmlFor="booking-email" className={labelClass}>Email</label>
        <Input id="booking-email" value={customer.email} readOnly className={`${fieldClass} bg-slate-50 text-slate-500`} />
      </div>

      <div>
        <label htmlFor="booking-address" className={labelClass}>Repair address</label>
        <Input id="booking-address" value={address} onChange={(event) => setAddress(event.target.value)} className={fieldClass} placeholder="House, road, area and city" required />
      </div>

      <div>
        <label htmlFor="booking-date" className={labelClass}>Preferred date</label>
        <Input id="booking-date" type="date" min={todayString()} value={preferredDate} onChange={(event) => setPreferredDate(event.target.value)} className={fieldClass} required />
      </div>

      <div>
        <label htmlFor="booking-problem" className={labelClass}>
          Problem description <span className="text-slate-400">(at least 20 characters)</span>
        </label>
        <textarea
          id="booking-problem"
          value={problemDescription}
          onChange={(event) => setProblemDescription(event.target.value)}
          rows={4}
          minLength={20}
          maxLength={2000}
          required
          placeholder="Describe the fault and what has already been tried."
          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400"
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-slate-900">
          <ClipboardCheck className="size-4 text-blue-600" aria-hidden="true" />
          Pay only after completion
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
          Your starting price is {formatPrice(price)}. The technician sets the
          final amount after the repair, and you pay only then.
        </p>
        <p className="mt-2 rounded-md border border-blue-100 bg-blue-50 px-2.5 py-2 text-[11px] leading-relaxed text-blue-700">
          Payment card details are entered manually on Stripe Checkout. FixMate never fills or stores them.
        </p>
      </div>

      {error ? (
        <p role="alert" className="text-[12.5px] font-medium text-rose-600">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            Sending request…
          </>
        ) : (
          <>
            <ClipboardCheck className="size-4" aria-hidden="true" />
            Send repair request
          </>
        )}
      </button>
      <p className="text-center text-[11px] leading-relaxed text-slate-500">
        No card payment is taken when this request is created.
      </p>
    </form>
  );
}
