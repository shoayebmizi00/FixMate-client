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
  Sparkles,
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
    title: "Pay after completion",
    description: "Nothing is charged until the repair is finished.",
  },
  {
    icon: Lock,
    title: "Secure checkout",
    description: "Card payments with a permanent receipt for every job.",
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
      callbackURL: "/",
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
                Your repairs, all in one place.
              </h2>
              <p className="mt-5 max-w-[360px] text-[15px] leading-relaxed text-slate-400">
                Sign in to track every job, follow each status update and pay only
                once the work is complete.
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
                      <p className="mt-0.5 text-[13px] leading-relaxed text-slate-400">
                        {benefit.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <p className="relative pt-10 text-xs text-slate-500">
              Trusted repairs. Transparent service. Pay after completion.
            </p>
          </aside>

          <div className="mx-auto w-full max-w-md min-w-0">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-8">
              <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.01em] text-[#0b1524]">
                Sign in to FixMate
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-500">
                Welcome back. Pick up right where you left off.
              </p>

              <div className="mt-7 grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleSocial("google")}
                  disabled={socialPending !== null || isSubmitting}
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
                  disabled={socialPending !== null || isSubmitting}
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
                  <span className="bg-white px-3 text-[11px] font-medium tracking-[0.14em] text-slate-400 uppercase">
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
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-[13px] font-medium text-slate-700"
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
                    className="h-11 rounded-xl border-slate-200 bg-white px-3.5 text-[15px] placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label
                      htmlFor="password"
                      className="text-[13px] font-medium text-slate-700"
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
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-11 rounded-xl border-slate-200 bg-white px-3.5 pr-11 text-[15px] placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition-colors hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Eye className="size-4" aria-hidden="true" />
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
                      className="text-[13px] font-normal text-slate-600"
                    >
                      Keep me signed in
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || socialPending !== null}
                  className={cn(
                    "h-11 w-full gap-2 rounded-full bg-blue-600 text-[14px] font-semibold text-white hover:bg-blue-500",
                    "disabled:opacity-70"
                  )}
                >
                  {isSubmitting ? (
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                  ) : null}
                  {isSubmitting ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </div>

            <p className="mt-6 text-center text-[14px] text-slate-500">
              New to FixMate?{" "}
              <Link
                href="/signup"
                className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
