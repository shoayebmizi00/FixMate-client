"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Service } from "@/lib/types";
import { toast } from "@/components/ui/toast";

export default function EditServiceForm({ service }: { service: Service }) {
  const router = useRouter();
  const [title, setTitle] = useState(service.title);
  const [category, setCategory] = useState(service.category);
  const [description, setDescription] = useState(service.description);
  const [basePrice, setBasePrice] = useState(String(service.basePrice));
  const [estimatedDuration, setEstimatedDuration] = useState(service.estimatedDuration);
  const [serviceMode, setServiceMode] = useState(service.serviceMode ?? "Home Visit");
  const [serviceArea, setServiceArea] = useState(service.serviceArea ?? "");
  const [image, setImage] = useState(service.image ?? "");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/services/${service._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          description,
          basePrice: Number(basePrice),
          estimatedDuration,
          serviceMode,
          serviceArea,
          image,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not update the service.");
      toast.add({ title: "Service updated", description: "It is pending admin approval again.", type: "success" });
      router.push(`/technician/services/${service._id}`);
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

  const inputClass = "h-11 w-full rounded-lg border border-slate-200 px-3.5 text-sm";

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6">
      <label className="text-sm font-medium">Title<input required value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} /></label>
      <label className="text-sm font-medium">Category
        <select value={category} onChange={(event) => setCategory(event.target.value)} className={inputClass}>
          {["Smartphone","Laptop & PC","AC","Refrigerator","TV","Washing Machine","Electrical"].map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="text-sm font-medium">Description<textarea required rows={5} value={description} onChange={(event) => setDescription(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3.5 py-3 text-sm" /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Base price (BDT)<input required type="number" min="1" value={basePrice} onChange={(event) => setBasePrice(event.target.value)} className={inputClass} /></label>
        <label className="text-sm font-medium">Estimated duration<input required value={estimatedDuration} onChange={(event) => setEstimatedDuration(event.target.value)} className={inputClass} /></label>
        <label className="text-sm font-medium">Service mode
          <select value={serviceMode} onChange={(event) => setServiceMode(event.target.value)} className={inputClass}>
            <option>Home Visit</option>
            <option>Shop Drop-off</option>
          </select>
        </label>
        <label className="text-sm font-medium">Service area<input required value={serviceArea} onChange={(event) => setServiceArea(event.target.value)} className={inputClass} /></label>
      </div>
      <label className="text-sm font-medium">Image URL<input value={image} onChange={(event) => setImage(event.target.value)} className={inputClass} /></label>
      <button type="submit" disabled={saving} className="h-11 rounded-full bg-blue-600 px-6 text-sm font-semibold text-white disabled:opacity-60">
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
