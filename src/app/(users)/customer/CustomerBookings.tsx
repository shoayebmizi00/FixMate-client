"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Wallet } from "lucide-react";

import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import type { Booking } from "@/lib/dashboard-data";
import {
  PaymentBadge,
  StatusBadge,
  formatDate,
  formatMoney,
} from "../components/dashboard-ui";

type CustomerInfo = {
  id: string;
  name: string;
  email: string;
};

function serviceName(booking: Booking) {
  return booking.serviceTitle ?? booking.service?.title ?? "Repair service";
}

const labelClass = "mb-1.5 block text-[13px] font-medium text-slate-800";
const fieldClass = "h-11 rounded-lg px-3.5 text-[14px]";

export default function CustomerBookings({
  bookings,
  customer,
}: {
  bookings: Booking[];
  customer: CustomerInfo;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fullName, setFullName] = useState(customer.name);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [method, setMethod] = useState("bKash");
  const [isPaying, setIsPaying] = useState(false);

  const selectedBooking = bookings.find((booking) => booking._id === selectedId);

  async function handlePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedBooking) return;

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      toast.add({
        title: "Missing details",
        description: "Enter your name, phone and address to pay.",
        type: "error",
      });
      return;
    }

    setIsPaying(true);

    try {
      // 1. Save the payment record.
      const transactionResponse = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBooking._id,
          customerId: customer.id,
          customerName: fullName.trim(),
          customerEmail: customer.email,
          customerPhone: phone.trim(),
          customerAddress: address.trim(),
          amount: selectedBooking.amount ?? 0,
          method,
        }),
      });
      const transactionData = (await transactionResponse.json()) as {
        error?: string;
      };

      if (!transactionResponse.ok) {
        throw new Error(transactionData.error ?? "Payment could not be saved.");
      }

      // 2. Mark the booking as paid.
      const bookingResponse = await fetch(
        `/api/bookings/${selectedBooking._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentStatus: "paid" }),
        }
      );
      const bookingData = (await bookingResponse.json()) as { error?: string };

      if (!bookingResponse.ok) {
        throw new Error(bookingData.error ?? "Booking could not be updated.");
      }

      toast.add({
        title: "Payment complete",
        description: `${formatMoney(selectedBooking.amount)} paid with ${method}.`,
        type: "success",
      });
      setSelectedId(null);
      setPhone("");
      setAddress("");
      router.refresh();
    } catch (error) {
      toast.add({
        title: "Payment failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        type: "error",
      });
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold tracking-[0.06em] text-slate-500 uppercase">
                <th className="px-5 py-3.5 font-semibold">Service</th>
                <th className="px-5 py-3.5 font-semibold">Preferred date</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Payment</th>
                <th className="px-5 py-3.5 font-semibold">Amount</th>
                <th className="px-5 py-3.5 font-semibold" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((booking) => {
                const paid = booking.paymentStatus === "paid";
                const closed =
                  booking.status === "cancelled" || booking.status === "rejected";

                return (
                  <tr key={booking._id} className="text-[13.5px] text-slate-600">
                    <td className="px-5 py-5 font-semibold text-slate-900">
                      {serviceName(booking)}
                    </td>
                    <td className="px-5 py-5">
                      {formatDate(booking.preferredDate)}
                    </td>
                    <td className="px-5 py-5">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-5 py-5">
                      <PaymentBadge status={booking.paymentStatus} />
                    </td>
                    <td className="px-5 py-5 font-semibold text-slate-900">
                      {formatMoney(booking.amount)}
                    </td>
                    <td className="px-5 py-5">
                      {!paid && !closed ? (
                        <button
                          type="button"
                          onClick={() => setSelectedId(booking._id)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-blue-600 px-4 text-[12.5px] font-semibold text-white hover:bg-blue-700"
                        >
                          <Wallet className="size-4" aria-hidden="true" />
                          Pay now
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {selectedBooking ? (
        <form
          onSubmit={handlePayment}
          className="rounded-xl border border-slate-200 bg-white p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[16px] font-semibold text-slate-900">
                Pay for {serviceName(selectedBooking)}
              </h2>
              <p className="mt-1 text-[12.5px] text-slate-500">
                Amount due: {formatMoney(selectedBooking.amount)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="text-[13px] font-medium text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pay-name" className={labelClass}>
                Full name
              </label>
              <Input
                id="pay-name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className={fieldClass}
                placeholder="Name on the payment"
              />
            </div>
            <div>
              <label htmlFor="pay-phone" className={labelClass}>
                Phone
              </label>
              <Input
                id="pay-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className={fieldClass}
                placeholder="Contact number"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="pay-address" className={labelClass}>
              Address
            </label>
            <Input
              id="pay-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className={fieldClass}
              placeholder="Where the repair happened"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="pay-method" className={labelClass}>
              Payment method
            </label>
            <select
              id="pay-method"
              value={method}
              onChange={(event) => setMethod(event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-[14px] text-slate-800 outline-none focus:border-blue-400"
            >
              <option value="bKash">bKash</option>
              <option value="Nagad">Nagad</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isPaying}
            className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-blue-600 px-6 text-[13.5px] font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isPaying
              ? "Processing…"
              : `Pay ${formatMoney(selectedBooking.amount)}`}
          </button>
        </form>
      ) : null}
    </div>
  );
}
