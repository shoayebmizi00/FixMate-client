"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from "@/components/ui/toast";

export default function ServiceActions({
  serviceId,
  isAvailable,
}: {
  serviceId: string;
  isAvailable: boolean;
}) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  async function toggleAvailability() {
    setSaving(true);
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !isAvailable }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not update availability.");
      toast.add({
        title: "Availability updated",
        description: isAvailable ? "This service is hidden from the catalogue." : "This service is visible in the catalogue.",
        type: "success",
      });
      router.refresh();
    } catch (error) {
      toast.add({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Please try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function deleteService() {
    setSaving(true);
    try {
      const response = await fetch(`/api/services/${serviceId}`, { method: "DELETE" });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not delete the service.");
      toast.add({ title: "Service deleted", description: "The listing was removed.", type: "success" });
      router.push("/technician/services");
    } catch (error) {
      toast.add({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Please try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={toggleAvailability} disabled={saving} className="h-9 rounded-full border border-slate-200 px-4 text-[12.5px] font-semibold text-slate-700 disabled:opacity-60">
          {isAvailable ? "Hide from catalogue" : "Make available"}
        </button>
        <Link href={`/technician/services/${serviceId}/edit`} className="inline-flex h-9 items-center rounded-full border border-blue-200 px-4 text-[12.5px] font-semibold text-blue-700">
          Edit service
        </Link>
        <button type="button" onClick={() => setConfirmDelete(true)} className="h-9 rounded-full border border-rose-200 px-4 text-[12.5px] font-semibold text-rose-600">
          Delete
        </button>
      </div>

      {confirmDelete ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-service-title">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 id="delete-service-title" className="text-lg font-semibold text-slate-900">Delete this service?</h2>
            <p className="mt-2 text-sm text-slate-500">This cannot be undone. Existing booking history will be kept.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmDelete(false)} className="h-10 rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-700">Cancel</button>
              <button type="button" onClick={deleteService} disabled={saving} className="h-10 rounded-full bg-rose-600 px-5 text-sm font-semibold text-white disabled:opacity-60">
                {saving ? "Deleting…" : "Delete service"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
