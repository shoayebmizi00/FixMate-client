"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from "@/components/ui/toast";
import type { DashboardService } from "@/lib/dashboard-data";
import {
  ApprovalBadge,
  formatMoney,
} from "../../components/dashboard-ui";

export default function AllServicesList({
  services,
}: {
  services: DashboardService[];
}) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function deleteService(id: string) {
    setSavingId(id);

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not delete the service.");
      }

      toast.add({
        title: "Service deleted",
        description: "The service was removed from FixMate.",
        type: "success",
      });
      setDeleteId(null);
      router.refresh();
    } catch (error) {
      toast.add({
        title: "Delete failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        type: "error",
      });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold tracking-[0.06em] text-slate-500 uppercase">
                <th className="px-5 py-3.5">No.</th>
                <th className="px-5 py-3.5">Service</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Technician</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((service, index) => {
                const imageUrl = service.image || service.thumbnail;

                return (
                  <tr key={service._id} className="text-[13.5px] text-slate-600">
                    <td className="px-5 py-4">{index + 1}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={service.title}
                              fill
                              unoptimized
                              sizes="56px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <p className="font-semibold text-slate-900">{service.title}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">{service.category || "—"}</td>
                    <td className="px-5 py-4">{service.technicianName || "—"}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {formatMoney(service.basePrice || service.price)}
                    </td>
                    <td className="px-5 py-4">
                      <ApprovalBadge status={service.approvalStatus} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setDeleteId(service._id)}
                        disabled={savingId === service._id}
                        className="h-9 rounded-full border border-rose-200 px-4 text-[12.5px] font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {services.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">
            No services found.
          </p>
        ) : null}
      </div>

      {deleteId ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-service-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 id="delete-service-title" className="text-lg font-semibold text-slate-900">
              Delete this service?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              This permanently removes the service listing.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="h-10 rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteService(deleteId)}
                disabled={savingId === deleteId}
                className="h-10 rounded-full bg-rose-600 px-5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {savingId === deleteId ? "Deleting…" : "Delete service"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
