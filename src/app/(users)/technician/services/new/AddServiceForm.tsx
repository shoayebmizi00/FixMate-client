"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, Loader2, ShieldCheck } from "lucide-react";

import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { SERVICE_CATEGORIES, SERVICE_MODES } from "@/lib/categories";

const labelClass = "mb-1.5 block text-[13px] font-medium text-slate-800";
const fieldClass = "h-11 rounded-lg px-3.5 text-[14px]";
const selectClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-[14px] text-slate-800 outline-none focus:border-blue-400";

export default function AddServiceForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<(typeof SERVICE_CATEGORIES)[number]>(
    SERVICE_CATEGORIES[0]
  );
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [serviceMode, setServiceMode] = useState<(typeof SERVICE_MODES)[number]>(
    SERVICE_MODES[0]
  );
  const [estimatedDuration, setEstimatedDuration] = useState("1-2 hours");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.add({
        title: "Unsupported file",
        description: "Choose a JPG, PNG, WEBP or GIF image.",
        type: "error",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.add({
        title: "Image too large",
        description: "The photo must be 5 MB or smaller.",
        type: "error",
      });
      return;
    }

    setIsUploading(true);

    try {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch("/api/upload", { method: "POST", body });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Upload failed.");
      }

      setThumbnail(data.url);
    } catch (error) {
      toast.add({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        type: "error",
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = Number(price);

    if (title.trim() === "") {
      toast.add({
        title: "Title required",
        description: "Give the service a short, clear name.",
        type: "error",
      });
      return;
    }

    if (description.trim() === "") {
      toast.add({
        title: "Description required",
        description: "Tell customers what this repair includes.",
        type: "error",
      });
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.add({
        title: "Invalid price",
        description: "Enter a price greater than zero.",
        type: "error",
      });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          basePrice: amount,
          serviceArea: location.trim(),
          serviceMode,
          estimatedDuration: estimatedDuration.trim(),
          description: description.trim(),
          image: thumbnail,
        }),
      });
      const data = (await response.json()) as {
        insertedId?: string;
        _id?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not add the service.");
      }

      toast.add({
        title: "Service submitted",
        description:
          "An admin will review it before it appears in the public catalogue.",
        type: "success",
      });

      const serviceId = data._id ?? data.insertedId;
      if (serviceId) {
        router.push(`/technician/services/${serviceId}`);
      } else {
        router.push("/technician/services");
      }
    } catch (error) {
      toast.add({
        title: "Could not add service",
        description:
          error instanceof Error ? error.message : "Please try again.",
        type: "error",
      });
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <ShieldCheck
          className="mt-0.5 size-5 shrink-0 text-blue-600"
          aria-hidden="true"
        />
        <p className="text-[13px] leading-relaxed text-blue-900">
          This service is saved to your technician account. An admin reviews it
          first, then it appears in the public catalogue where customers can
          book it. Every booking is linked back to your dashboard automatically.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6"
      >
        <div>
          <label htmlFor="service-thumbnail" className={labelClass}>
            Service photo
          </label>

          <label
            htmlFor="service-thumbnail"
            className="relative flex aspect-[1.9] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50"
          >
            <input
              id="service-thumbnail"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={handleUpload}
            />

            {isUploading ? (
              <span className="flex flex-col items-center gap-2 text-slate-500">
                <Loader2 className="size-6 animate-spin" aria-hidden="true" />
                <span className="text-[13px]">Uploading…</span>
              </span>
            ) : thumbnail ? (
              <Image
                src={thumbnail}
                alt="Service preview"
                fill
                unoptimized
                sizes="(min-width: 1024px) 720px, 100vw"
                className="object-cover"
              />
            ) : (
              <span className="flex flex-col items-center gap-2 text-slate-500">
                <ImagePlus className="size-7" aria-hidden="true" />
                <span className="text-[13px]">Upload a photo</span>
                <span className="text-[11.5px] text-slate-400">
                  JPG, PNG, WEBP or GIF up to 5 MB
                </span>
              </span>
            )}
          </label>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="service-title" className={labelClass}>
              Service title
            </label>
            <Input
              id="service-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={fieldClass}
              placeholder="Example: Washing machine repair"
            />
          </div>

          <div>
            <label htmlFor="service-category" className={labelClass}>
              Category
            </label>
            <select
              id="service-category"
              value={category}
              onChange={(event) => {
                const selected = SERVICE_CATEGORIES.find(
                  (option) => option === event.target.value
                );
                if (selected) setCategory(selected);
              }}
              className={selectClass}
            >
              {SERVICE_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="service-price" className={labelClass}>
              Price (BDT)
            </label>
            <Input
              id="service-price"
              type="number"
              min="1"
              step="0.01"
              inputMode="decimal"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className={fieldClass}
              placeholder="1500"
            />
          </div>

          <div>
            <label htmlFor="service-location" className={labelClass}>
              Service area
            </label>
            <Input
              id="service-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className={fieldClass}
              placeholder="Example: Dhanmondi, Dhaka"
            />
          </div>

          <div>
            <label htmlFor="service-mode" className={labelClass}>
              Service mode
            </label>
            <select
              id="service-mode"
              value={serviceMode}
              onChange={(event) => {
                const selected = SERVICE_MODES.find(
                  (option) => option === event.target.value
                );
                if (selected) setServiceMode(selected);
              }}
              className={selectClass}
            >
              {SERVICE_MODES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="service-duration" className={labelClass}>
              Estimated duration
            </label>
            <Input
              id="service-duration"
              value={estimatedDuration}
              onChange={(event) => setEstimatedDuration(event.target.value)}
              className={fieldClass}
              placeholder="Example: 1-2 hours"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="service-description" className={labelClass}>
              Description
            </label>
            <textarea
              id="service-description"
              rows={5}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-[14px] text-slate-800 outline-none focus:border-blue-400"
              placeholder="What does this repair include? Mention parts, checks and anything the customer should know."
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-blue-600 px-6 text-[13.5px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            {isSaving ? "Saving…" : "Submit for approval"}
          </button>

          <Link
            href="/technician/services"
            className="text-[13px] font-medium text-slate-500 hover:text-slate-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
