"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, X } from "lucide-react";

import { toast } from "@/components/ui/toast";
import type { DashboardService } from "@/lib/dashboard-data";
import {
  ApprovalBadge,
  formatMoney,
  humanize,
  normalizeStatus,
} from "../../components/dashboard-ui";
import FilterTabs from "../../components/FilterTabs";

const filters = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "All", value: "all" },
];

export default function ServiceApprovalList({
  services,
  technicianNames,
}: {
  services: DashboardService[];
  technicianNames: Record<string, string>;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState("pending");
  const [savingId, setSavingId] = useState<string | null>(null);

  const visibleServices = services.filter((service) => {
    if (filter === "all") return true;

    const status = normalizeStatus(service.approvalStatus);
    if (filter === "pending") return status !== "approved" && status !== "rejected";
    return status === filter;
  });

  async function updateStatus(id: string, approvalStatus: string) {
    setSavingId(id);

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalStatus }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not update this service.");
      }

      toast.add({
        title: `Service ${approvalStatus}`,
        description: "The public catalogue has been updated.",
        type: "success",
      });
      router.refresh();
    } catch (error) {
      toast.add({
        title: "Update failed",
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
      <FilterTabs options={filters} value={filter} onChange={setFilter} />

      {visibleServices.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-[13px] text-slate-500">
          No services in this list yet.
        </p>
      ) : (
        <div className="space-y-3">
          {visibleServices.map((service) => {
            const technicianName = service.technicianId
              ? technicianNames[service.technicianId]
              : undefined;
            const status = normalizeStatus(service.approvalStatus);
            const imageUrl = service.image || service.thumbnail;
            const amount = service.basePrice || service.price;

            return (
              <article
                key={service._id}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
              >
                <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:w-[104px]">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={service.title}
                      fill
                      unoptimized
                      sizes="104px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="grid size-full place-items-center text-[11px] text-slate-400">
                      No photo
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <ApprovalBadge status={service.approvalStatus} />
                    <span className="text-[10.5px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
                      {service.category ?? "Service"} ·{" "}
                      {humanize(service.serviceMode ?? "home visit")}
                    </span>
                  </div>

                  <h2 className="mt-2 text-[16px] font-semibold text-slate-900">
                    {service.title}
                  </h2>
                  <p className="mt-1 text-[12.5px] text-slate-500">
                    {[
                      technicianName ?? "Unassigned technician",
                      formatMoney(amount),
                      service.serviceArea || service.location,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {status !== "approved" ? (
                    <button
                      type="button"
                      disabled={savingId === service._id}
                      onClick={() => updateStatus(service._id, "approved")}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-blue-600 px-5 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                    >
                      <Check className="size-4" aria-hidden="true" />
                      Approve
                    </button>
                  ) : null}
                  {status !== "rejected" ? (
                    <button
                      type="button"
                      disabled={savingId === service._id}
                      onClick={() => updateStatus(service._id, "rejected")}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-red-200 bg-white px-5 text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                    >
                      <X className="size-4" aria-hidden="true" />
                      Reject
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
