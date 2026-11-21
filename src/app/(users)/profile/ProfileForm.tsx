"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { authClient } from "@/lib/auth-client";
import { humanize } from "../components/dashboard-ui";

type ProfileUser = {
  name: string;
  email: string;
  role?: string | null;
  image?: string | null;
  phone?: string | null;
  area?: string | null;
  bio?: string | null;
};

const labelClass = "mb-1.5 block text-[13px] font-medium text-slate-800";
const fieldClass = "h-11 rounded-lg px-3.5 text-[14px]";

export default function ProfileForm({ user }: { user: ProfileUser }) {
  const router = useRouter();
  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [serviceArea, setServiceArea] = useState(user.area ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [imageUrl, setImageUrl] = useState(user.image ?? "");
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

      setImageUrl(data.url);
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

    if (name.trim() === "") {
      toast.add({
        title: "Name required",
        description: "Enter your full name.",
        type: "error",
      });
      return;
    }

    setIsSaving(true);

    const { error } = await authClient.updateUser({
      name: name.trim(),
      phone: phone.trim(),
      area: serviceArea.trim(),
      bio: bio.trim(),
      image: imageUrl || undefined,
    });

    setIsSaving(false);

    if (error) {
      toast.add({
        title: "Could not save",
        description: error.message ?? "Please try again.",
        type: "error",
      });
      return;
    }

    toast.add({
      title: "Profile saved",
      description: "Your details have been updated.",
      type: "success",
    });
    router.refresh();
  }

  return (
    <div className="grid gap-4 md:grid-cols-[300px_1fr]">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-[15px] font-semibold text-slate-900">
          Profile photo
        </h2>

        <label className="mt-5 flex h-[220px] cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white">
          <input
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
          ) : imageUrl ? (
            <span className="relative size-full">
              <Image
                src={imageUrl}
                alt=""
                fill
                unoptimized
                sizes="300px"
                className="object-cover"
              />
            </span>
          ) : (
            <span className="flex flex-col items-center gap-2 text-slate-500">
              <ImagePlus className="size-7" aria-hidden="true" />
              <span className="text-[13px]">Upload a photo</span>
            </span>
          )}
        </label>

        <div className="mt-5 rounded-lg bg-slate-50 p-4">
          <p className="text-[13.5px] font-semibold text-slate-900">
            {user.email}
          </p>
          <span className="mt-2 inline-block rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-semibold tracking-[0.06em] text-slate-700 uppercase">
            {humanize(user.role ?? "customer")}
          </span>
          <p className="mt-3 text-[12px] leading-relaxed text-slate-500">
            Email and role are managed by FixMate and cannot be edited here.
          </p>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6"
      >
        <div>
          <label htmlFor="profile-name" className={labelClass}>
            Full name
          </label>
          <Input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={fieldClass}
            placeholder="Your full name"
          />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="profile-phone" className={labelClass}>
              Phone
            </label>
            <Input
              id="profile-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className={fieldClass}
              placeholder="Contact number"
            />
          </div>
          <div>
            <label htmlFor="profile-area" className={labelClass}>
              Service area
            </label>
            <Input
              id="profile-area"
              value={serviceArea}
              onChange={(event) => setServiceArea(event.target.value)}
              className={fieldClass}
              placeholder="City or area"
            />
          </div>
        </div>

        <div className="mt-5">
          <label htmlFor="profile-bio" className={labelClass}>
            Bio
          </label>
          <textarea
            id="profile-bio"
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={6}
            placeholder="Tell customers about your experience and specialties."
            className="w-full rounded-lg border border-slate-200 px-3.5 py-3 text-[14px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving || isUploading}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-blue-600 px-6 text-[13.5px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
        >
          {isSaving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
