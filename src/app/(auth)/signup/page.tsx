"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  LoaderCircle,
  ShieldCheck,
  UserRound,
  Wrench,
  Clock,
  BadgeCheck,
} from "lucide-react";

import { signIn, signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordRules = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "Uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "Lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { label: "Number", test: (value: string) => /\d/.test(value) },
  {
    label: "Special character",
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
];

const inputClass =
  "h-11 rounded-xl border-slate-200 bg-white px-3.5 text-sm text-slate-900 shadow-none transition placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-blue-600 focus-visible:ring-4 focus-visible:ring-blue-600/10";

const labelClass = "text-sm font-medium text-slate-800";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.87Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.28v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.3a7.2 7.2 0 0 1 0-4.6V6.61H1.28a12 12 0 0 0 0 10.78l3.99-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.28 6.61l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-1.96c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.33.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}

// Allows pages to send users back after sign-up, for example a booking page.
function nextPath() {
  if (typeof window === "undefined") return "/dashboard";

  const next = new URLSearchParams(window.location.search).get("next");

  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }

  return next;
}

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"customer" | "technician">("customer");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialPending, setSocialPending] = useState<"google" | "github" | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const passwordValid = passwordRules.every((rule) => rule.test(password));
  const passwordsMatch =
    confirmPassword.length > 0 && confirmPassword === password;

  // Sign up with Google.
  // better-auth creates the account automatically the first time
  // someone signs in with Google.
  async function handleGoogle() {
    setError(null);
    setSocialPending("google");

    try {
      const result = await signIn.social({
        provider: "google",
        callbackURL: nextPath(),
        additionalData: { role },
      });

      if (result.error) {
        setError(result.error.message ?? "Google sign up failed. Please try again.");
        setSocialPending(null);
      }
      // No error means better-auth is redirecting the browser to Google,
      // so we leave the button in its loading state.
    } catch {
      setError("Could not reach the server. Please try again.");
      setSocialPending(null);
    }
  }

  // Sign up with GitHub (same idea as Google).
  async function handleGithub() {
    setError(null);
    setSocialPending("github");

    try {
      const result = await signIn.social({
        provider: "github",
        callbackURL: nextPath(),
        additionalData: { role },
      });

      if (result.error) {
        setError(result.error.message ?? "GitHub sign up failed. Please try again.");
        setSocialPending(null);
      }
    } catch {
      setError("Could not reach the server. Please try again.");
      setSocialPending(null);
    }
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setImageError(null);

    if (!file.type.startsWith("image/")) {
      setImageError("Choose an image file (JPG, PNG, WEBP or GIF).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image must be 5 MB or smaller.");
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
    } catch (uploadError) {
      setImageError(
        uploadError instanceof Error ? uploadError.message : "Upload failed."
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (isUploading) {
      setError("Wait for your profile photo to finish uploading.");
      return;
    }

    if (name.trim() === "") {
      setError("Enter your full name.");
      return;
    }

    if (emailPattern.test(email.trim()) === false) {
      setError("Enter a valid email address.");
      return;
    }

    if (!passwordValid) {
      setError("Your password does not meet all the requirements below.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the account, then better-auth signs the user in
      // and sets the session cookie for us.
      const result = await signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        image: imageUrl ?? undefined,
        role,
      });

      if (result.error) {
        setError(result.error.message ?? "Unable to create your account.");
        setIsSubmitting(false);
        return;
      }

      toast.add({
        title: "Account created",
        description: "Welcome to FixMate!",
        type: "success",
      });

      router.push(nextPath());
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
      setIsSubmitting(false);
    }
  }

  const busy = socialPending !== null || isSubmitting || isUploading;

  const roleOptions = [
    {
      value: "customer" as const,
      title: "Customer",
      hint: "Find help for repairs",
      Icon: UserRound,
    },
    {
      value: "technician" as const,
      title: "Technician",
      hint: "Offer your skills",
      Icon: Wrench,
    },
  ];

  return (
    <main className="grid min-h-dvh bg-white font-[family-name:var(--font-geist-sans)] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Brand panel (desktop only) */}
      <aside className="relative hidden overflow-hidden bg-[#0B1F4B] text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        {/* blueprint grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(ellipse at 30% 20%, black 20%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 30% 20%, black 20%, transparent 75%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -right-32 size-[28rem] rounded-full bg-blue-500/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-1/3 size-72 rounded-full bg-amber-400/10 blur-3xl"
        />

        <Link href="/" className="relative flex items-center gap-3">
          <span className="relative size-10 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/15">
            <Image
              src={logo}
              alt="FixMate logo"
              fill
              sizes="40px"
              className="object-cover"
            />
          </span>
          <span className="text-xl font-semibold tracking-tight">FixMate</span>
        </Link>

        <div className="relative max-w-md">
          <h2 className="text-4xl leading-[1.1] font-semibold tracking-tight xl:text-5xl">
            Something broke.
            <br />
            Someone can fix it.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-blue-100/80">
            Create an account to book trusted technicians, or join as a
            technician and start taking jobs near you.
          </p>

          <ul className="mt-10 space-y-5">
            {[
              {
                Icon: BadgeCheck,
                title: "Skilled professionals",
                text: "Technicians with the right tools for the job.",
              },
              {
                Icon: Clock,
                title: "Quick to get started",
                text: "Sign up in a minute with email, Google or GitHub.",
              },
              {
                Icon: ShieldCheck,
                title: "Your data stays protected",
                text: "Secure sign-in and a password only you know.",
              },
            ].map(({ Icon, title, text }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <Icon className="size-5 text-amber-300" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-0.5 text-sm text-blue-100/70">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-blue-100/50">
          © 2026 FixMate
        </p>
      </aside>

      {/* Form panel */}
      <section className="relative flex items-start justify-center bg-slate-50 px-5 py-10 sm:px-8 lg:items-center lg:bg-white lg:py-12">
        <div className="w-full max-w-[440px]">
          {/* Mobile brand */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="text-xl font-semibold tracking-tight text-slate-900">
              FixMate
            </span>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.18)] sm:p-8 lg:border-0 lg:p-0 lg:shadow-none">
            <header>
              <h1 className="text-[28px] leading-8 font-semibold tracking-tight text-slate-900">
                Create your account
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
                >
                  Sign in
                </Link>
              </p>
            </header>

            {/* Social */}
            <div className="mt-7 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogle}
                disabled={busy}
                className="h-11 gap-2.5 rounded-xl border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-none transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              >
                {socialPending === "google" ? (
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <GoogleIcon className="size-[18px]" />
                )}
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleGithub}
                disabled={busy}
                className="h-11 gap-2.5 rounded-xl border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-none transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              >
                {socialPending === "github" ? (
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <GithubIcon className="size-[18px]" />
                )}
                GitHub
              </Button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-slate-400 lg:bg-white">
                  or continue with email
                </span>
              </div>
            </div>

            {error ? (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Role */}
              <div className="space-y-2">
                <p id="role-label" className={labelClass}>
                  I want to sign up as
                </p>
                <div
                  role="group"
                  aria-labelledby="role-label"
                  className="grid grid-cols-2 gap-3"
                >
                  {roleOptions.map(({ value, title, hint, Icon }) => {
                    const selected = role === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setRole(value)}
                        className={cn(
                          "relative flex items-center gap-3 rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/15",
                          selected
                            ? "border-blue-600 bg-blue-50/70 ring-1 ring-blue-600"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-9 shrink-0 place-items-center rounded-lg transition-colors",
                            selected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-500"
                          )}
                        >
                          <Icon className="size-[18px]" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span
                            className={cn(
                              "block text-sm font-semibold",
                              selected ? "text-blue-900" : "text-slate-800"
                            )}
                          >
                            {title}
                          </span>
                          <span className="block truncate text-xs text-slate-500">
                            {hint}
                          </span>
                        </span>
                        {selected ? (
                          <span className="absolute right-2 top-2 grid size-4 place-items-center rounded-full bg-blue-600 text-white">
                            <Check className="size-3" aria-hidden="true" />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photo */}
              <div>
                <div className="flex items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-3">
                  <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt="Profile photo preview"
                        width={56}
                        height={56}
                        unoptimized
                        className="size-full object-cover"
                      />
                    ) : (
                      <UserRound
                        className="size-6 text-slate-300"
                        aria-hidden="true"
                      />
                    )}
                    {isUploading ? (
                      <span className="absolute inset-0 grid place-items-center bg-slate-900/55">
                        <LoaderCircle
                          className="size-5 animate-spin text-white"
                          aria-hidden="true"
                        />
                      </span>
                    ) : null}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        Profile photo{" "}
                        <span className="font-normal text-slate-500">(optional)</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        JPG, PNG, WEBP · 5 MB max
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={busy}
                        className="h-8 gap-1.5 rounded-lg border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-none hover:bg-slate-50"
                      >
                        {isUploading ? (
                          <LoaderCircle
                            className="size-3.5 animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <ImagePlus className="size-3.5" aria-hidden="true" />
                        )}
                        {imageUrl ? "Change" : "Upload"}
                      </Button>
                      {imageUrl && !isUploading ? (
                        <button
                          type="button"
                          onClick={() => {
                            setImageUrl(null);
                            setImageError(null);
                          }}
                          className="text-xs font-medium text-slate-500 transition-colors hover:text-red-600"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="sr-only"
                    onChange={handleImageChange}
                  />
                </div>

                {imageError ? (
                  <p role="alert" className="mt-2 text-xs text-red-600">
                    {imageError}
                  </p>
                ) : null}
              </div>

              {/* Name + email */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className={labelClass}>
                    Full name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your full name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className={labelClass}>
                    Email address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Passwords */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="password" className={labelClass}>
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className={cn(inputClass, "pr-11")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-400 transition-colors hover:text-slate-700 focus-visible:text-slate-700 focus-visible:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="size-[18px]" aria-hidden="true" />
                      ) : (
                        <Eye className="size-[18px]" aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-2">
                    {passwordRules.map((rule) => {
                      const isMet = rule.test(password);

                      return (
                        <li
                          key={rule.label}
                          className={cn(
                            "flex items-center gap-1.5 text-xs transition-colors",
                            isMet ? "text-emerald-600" : "text-slate-500"
                          )}
                        >
                          <span
                            className={cn(
                              "grid size-4 shrink-0 place-items-center rounded-full transition-colors",
                              isMet
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-200 text-transparent"
                            )}
                          >
                            <Check className="size-3" aria-hidden="true" />
                          </span>
                          {rule.label}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className={labelClass}>
                    Confirm password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      aria-invalid={
                        confirmPassword.length > 0 && !passwordsMatch
                      }
                      className={cn(inputClass, "pr-11")}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((visible) => !visible)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide password confirmation"
                          : "Show password confirmation"
                      }
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-400 transition-colors hover:text-slate-700 focus-visible:text-slate-700 focus-visible:outline-none"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-[18px]" aria-hidden="true" />
                      ) : (
                        <Eye className="size-[18px]" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && !passwordsMatch ? (
                    <p className="text-xs text-red-600">
                      Passwords do not match.
                    </p>
                  ) : null}
                </div>
              </div>

              <Button
                type="submit"
                disabled={busy}
                className="h-12 w-full gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.6)] transition hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-600/25 disabled:opacity-70 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                {isSubmitting ? "Creating account…" : "Create account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
              By creating an account you agree to our{" "}
              <Link
                href="/terms"
                className="font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}