"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  HandCoins,
  LoaderCircle,
  Lock,
  ShieldCheck,
} from "lucide-react";

import logo from "@/assets/logo.png";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
    title: "Secure card payments",
    description:
      "Bookings are confirmed through Stripe with a receipt for every job.",
  },
  {
    icon: Lock,
    title: "Secure checkout",
    description: "Card payments with a permanent receipt for every job.",
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

// Allows pages to send users back after sign-in, for example a booking page.
function nextPath() {
  if (typeof window === "undefined") return "/dashboard";

  const next = new URLSearchParams(window.location.search).get("next");

  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }

  return next;
}

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialPending, setSocialPending] = useState<"google" | "github" | null>(
    null
  );

  async function handleSocial(provider: "google" | "github") {
    setError(null);
    setSocialPending(provider);

    const { error: socialError } = await signIn.social({
      provider,
      callbackURL: nextPath(),
    });

    if (socialError) {
      setError(socialError.message ?? `Unable to continue with ${provider}.`);
      setSocialPending(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    const { error: signInError } = await signIn.email({
      email: email.trim(),
      password,
      rememberMe,
    });

    if (signInError) {
      setError(signInError.message ?? "Unable to sign in. Please try again.");
      setIsSubmitting(false);
      return;
    }

    router.push(nextPath());
    router.refresh();
  }

  const busy = socialPending !== null || isSubmitting;

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
            Your repairs, all in one place.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-blue-100/80">
            Sign in to book a repair, pay securely by card and follow each
            status update.
          </p>

          <ul className="mt-10 space-y-5">
            {benefits.map((benefit) => (
              <li key={benefit.title} className="flex items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <benefit.icon
                    className="size-5 text-amber-300"
                    aria-hidden="true"
                  />
                </span>
                <div>
                  <p className="text-sm font-semibold">{benefit.title}</p>
                  <p className="mt-0.5 text-sm text-blue-100/70">
                    {benefit.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-blue-100/50">
          Trusted repairs. Transparent service. Secure card checkout.
        </p>
      </aside>

      {/* Form panel */}
      <section className="relative flex items-start justify-center bg-slate-50 px-5 py-10 sm:px-8 lg:items-center lg:bg-white lg:py-12">
        <div className="w-full max-w-[440px]">
          {/* Mobile brand */}
          <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="relative size-9 shrink-0 overflow-hidden rounded-xl ring-1 ring-slate-200">
              <Image
                src={logo}
                alt="FixMate logo"
                fill
                sizes="36px"
                className="object-cover"
              />
            </span>
            <span className="text-xl font-semibold tracking-tight text-slate-900">
              FixMate
            </span>
          </Link>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.18)] sm:p-8 lg:border-0 lg:p-0 lg:shadow-none">
            <header>
              <h1 className="text-[28px] leading-8 font-semibold tracking-tight text-slate-900">
                Sign in to FixMate
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Welcome back. Pick up right where you left off.
              </p>
            </header>

            {/* Social */}
            <div className="mt-7 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocial("google")}
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
                onClick={() => handleSocial("github")}
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
                <span className="bg-white px-3 text-xs text-slate-400">
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

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
                    autoComplete="current-password"
                    placeholder="Enter your password"
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
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked)}
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-normal text-slate-600"
                  >
                    Keep me signed in
                  </Label>
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
                {isSubmitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              New to FixMate?{" "}
              <Link
                href="/sign-up"
                className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}