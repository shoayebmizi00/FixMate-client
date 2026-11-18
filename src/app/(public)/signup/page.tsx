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
  HandCoins,
  ImagePlus,
  LoaderCircle,
  Lock,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import logo from "@/assets/logo.png";
import { signIn, signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Verified technicians",
    description: "Every pro is reviewed before they can take a job.",
  },
  {
    icon: HandCoins,
    title: "Pay after completion",
    description: "Nothing is charged until the repair is finished.",
  },
  {
    icon: Lock,
    title: "Secure checkout",
    description: "Card payments with a permanent receipt for every job.",
  },
];

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

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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

  async function handleSocial(provider: "google" | "github") {
    setError(null);
    setSocialPending(provider);

    const { error: socialError } = await signIn.social({
      provider,
      callbackURL: "/",
    });

    if (socialError) {
      setError(socialError.message ?? `Unable to continue with ${provider}.`);
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

    if (!name.trim()) {
      setError("Enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
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

    const { error: signUpError } = await signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
      ...(imageUrl ? { image: imageUrl } : {}),
    });

    if (signUpError) {
      setError(signUpError.message ?? "Unable to create your account.");
      setIsSubmitting(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
          <aside className="relative isolate hidden overflow-hidden rounded-3xl bg-[#040a17] p-10 lg:flex lg:flex-col">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_70%_at_25%_30%,rgba(37,99,235,0.38),transparent_70%)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_90%_at_30%_18%,rgba(30,64,175,0.28),transparent_75%)]"
            />

            <Link href="/" className="relative flex items-center gap-3">
              <span className="relative size-10 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10">
                <Image
                  src={logo}
                  alt="FixMate logo"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </span>
              <span className="text-xl font-bold tracking-tight text-white">
                Fix<span className="text-blue-500">Mate</span>
              </span>
            </Link>

            <div className="relative flex flex-1 flex-col justify-center py-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3.5 py-1.5 text-[10.5px] font-semibold tracking-[0.16em] text-cyan-300 uppercase">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Verified technicians
              </span>
              <h2 className="mt-6 text-[38px] leading-[1.1] font-semibold tracking-[-0.02em] text-white">
                Repairs without the guesswork.
              </h2>
              <p className="mt-5 max-w-[360px] text-[15px] leading-relaxed text-slate-300">
                Create an account to book verified pros for phones, laptops,
                appliances and home electrical work.
              </p>

              <ul className="mt-9 space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit.title} className="flex gap-3">
                    <benefit.icon
                      className="mt-0.5 size-4 shrink-0 text-cyan-400"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-[14px] font-medium text-white">
                        {benefit.title}
                      </p>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-slate-300">
                        {benefit.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <p className="relative pt-10 text-xs text-slate-400">
              Trusted repairs. Transparent service. Pay after completion.
            </p>
          </aside>

          <div className="mx-auto w-full max-w-md min-w-0">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-8">
              <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.01em] text-[#0b1524]">
                Create your account
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-600">
                Book verified technicians and pay only when the job is done.
              </p>

              <div className="mt-7 grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocial("google")}
                  disabled={socialPending !== null || isSubmitting || isUploading}
                  className="h-11 gap-2 rounded-xl border-slate-200 text-[14px] font-medium text-slate-700 hover:bg-slate-50"
                >
                  {socialPending === "google" ? (
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <GoogleIcon className="size-4" />
                  )}
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocial("github")}
                  disabled={socialPending !== null || isSubmitting || isUploading}
                  className="h-11 gap-2 rounded-xl border-slate-200 text-[14px] font-medium text-slate-700 hover:bg-slate-50"
                >
                  {socialPending === "github" ? (
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <GithubIcon className="size-4" />
                  )}
                  GitHub
                </Button>
              </div>

              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-[11px] font-medium tracking-[0.14em] text-slate-500 uppercase">
                    or continue with email
                  </span>
                </div>
              </div>

              {error ? (
                <div
                  role="alert"
                  className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600"
                >
                  {error}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="mt-5 space-y-5" noValidate>
                <div>
                  <div className="flex items-center gap-4">
                    <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt="Profile photo preview"
                          width={64}
                          height={64}
                          unoptimized
                          className="size-full object-cover"
                        />
                      ) : (
                        <UserRound
                          className="size-6 text-slate-500"
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

                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-slate-800">
                        Profile photo{" "}
                        <span className="font-normal text-slate-500">
                          (optional)
                        </span>
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={socialPending !== null || isSubmitting || isUploading}
                          className="h-8 gap-1.5 rounded-lg border-slate-200 px-3 text-[12.5px] font-medium text-slate-700 hover:bg-slate-50"
                        >
                          {isUploading ? (
                            <LoaderCircle
                              className="size-3.5 animate-spin"
                              aria-hidden="true"
                            />
                          ) : (
                            <ImagePlus className="size-3.5" aria-hidden="true" />
                          )}
                          {imageUrl ? "Change photo" : "Upload photo"}
                        </Button>
                        {imageUrl && !isUploading ? (
                          <button
                            type="button"
                            onClick={() => {
                              setImageUrl(null);
                              setImageError(null);
                            }}
                            className="text-[12.5px] font-medium text-slate-500 transition-colors hover:text-red-600"
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                      <p className="mt-1 text-[11.5px] text-slate-500">
                        JPG, PNG or WEBP · up to 5 MB
                      </p>
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
                    <p role="alert" className="mt-2 text-[12px] text-red-500">
                      {imageError}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-[13px] font-medium text-slate-800"
                  >
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
                    className="h-11 rounded-xl border-slate-200 bg-white px-3.5 text-[15px] placeholder:text-slate-500 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-[13px] font-medium text-slate-800"
                  >
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
                    className="h-11 rounded-xl border-slate-200 bg-white px-3.5 text-[15px] placeholder:text-slate-500 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label
                      htmlFor="password"
                      className="text-[13px] font-medium text-slate-800"
                    >
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-[13px] font-medium text-blue-600 transition-colors hover:text-blue-700"
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
                      className="h-11 rounded-xl border-slate-200 bg-white px-3.5 pr-11 text-[15px] placeholder:text-slate-500 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 transition-colors hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Eye className="size-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1">
                    {passwordRules.map((rule) => {
                      const isMet = rule.test(password);

                      return (
                        <li
                          key={rule.label}
                          className={cn(
                            "flex items-center gap-1.5 text-[12px] leading-tight transition-colors",
                            isMet ? "text-emerald-600" : "text-slate-500"
                          )}
                        >
                          <Check
                            className={cn(
                              "size-3.5",
                              isMet ? "opacity-100" : "opacity-40"
                            )}
                            aria-hidden="true"
                          />
                          {rule.label}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-[13px] font-medium text-slate-800"
                  >
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
                      className="h-11 rounded-xl border-slate-200 bg-white px-3.5 pr-11 text-[15px] placeholder:text-slate-500 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
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
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 transition-colors hover:text-slate-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Eye className="size-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && !passwordsMatch ? (
                    <p className="text-[12px] text-red-500">
                      Passwords do not match.
                    </p>
                  ) : null}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || socialPending !== null || isUploading}
                  className={cn(
                    "h-11 w-full gap-2 rounded-full bg-blue-600 text-[14px] font-semibold text-white hover:bg-blue-500",
                    "disabled:opacity-70"
                  )}
                >
                  {isSubmitting ? (
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                  ) : null}
                  {isSubmitting ? "Creating account…" : "Create account"}
                </Button>
              </form>

              <p className="mt-5 text-center text-[12px] leading-relaxed text-slate-500">
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

            <p className="mt-6 text-center text-[14px] text-slate-600">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
