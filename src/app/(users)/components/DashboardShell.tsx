"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CircleDollarSign,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  User,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";

import logo from "@/assets/logo.png";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export type DashboardShellUser = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  image?: string | null;
};

const adminLinks = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Manage users", href: "/admin/manage-users", icon: Users },
  {
    label: "Service approval",
    href: "/admin/service-approval",
    icon: ShieldCheck,
  },
  { label: "All bookings", href: "/admin/all-bookings", icon: ClipboardList },
  {
    label: "Transactions",
    href: "/admin/transactions",
    icon: CircleDollarSign,
  },
  { label: "Profile", href: "/profile", icon: User },
];

const customerLinks = [
  { label: "Overview", href: "/customer", icon: LayoutDashboard },
  { label: "My bookings", href: "/customer/bookings", icon: ClipboardList },
  { label: "Payments", href: "/customer/payments", icon: Wallet },
  { label: "Profile", href: "/profile", icon: User },
];

const technicianLinks = [
  { label: "Overview", href: "/technician", icon: LayoutDashboard },
  { label: "My services", href: "/technician/services", icon: Wrench },
  { label: "Bookings", href: "/technician/bookings", icon: ClipboardList },
  {
    label: "Earnings",
    href: "/technician/earnings",
    icon: CircleDollarSign,
  },
  { label: "Profile", href: "/profile", icon: User },
];

function getInitials(name?: string | null) {
  if (!name) return "U";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function linksForRole(role?: string | null) {
  if (role === "admin") return adminLinks;
  if (role === "technician") return technicianLinks;
  return customerLinks;
}

function isLinkActive(pathname: string, href: string) {
  if (href === "/admin" || href === "/customer" || href === "/technician") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardShell({
  user,
  children,
}: {
  user: DashboardShellUser;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const links = linksForRole(user.role);
  const roleLabel =
    user.role === "admin"
      ? "Admin"
      : user.role === "technician"
        ? "Technician"
        : "Customer";

  async function handleSignOut() {
    await signOut();
    router.push("/signin");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh bg-[#f6f9fc] font-[family-name:var(--font-geist-sans)]">
      <aside className="sticky top-0 hidden h-dvh w-[253px] shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <Link href="/">
          <div className="flex h-[72px] items-center gap-3 px-6">
            <span className="relative size-10 shrink-0 overflow-hidden rounded-xl ring-1 ring-slate-900/5">
              <Image
                src={logo}
                alt="FixMate logo"
                fill
                sizes="40px"
                className="object-cover"
                priority
              />
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Fix<span className="text-blue-600">Mate</span>
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3 border-y border-slate-200 px-6 py-4">
          <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-[13px] font-semibold text-blue-700">
            {user.image ? (
              <Image
                src={user.image}
                alt=""
                width={44}
                height={44}
                unoptimized
                className="size-full object-cover"
              />
            ) : (
              getInitials(user.name)
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-slate-900">
              {user.name}
            </p>
            <span className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-slate-600 uppercase">
              {roleLabel}
            </span>
          </div>
        </div>

        <nav aria-label="Dashboard" className="flex-1 space-y-1 px-3 py-4">
          {links.map((link) => {
            const active = isLinkActive(pathname, link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[14px] font-medium transition-colors",
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <Icon className="size-[18px] shrink-0" aria-hidden="true" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-[14px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <LogOut className="size-[18px]" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <p className="text-[15px] font-medium text-slate-500">Dashboard</p>

          <div className="flex items-center gap-3">
            <Link
              href="/services"
              className="hidden h-9 items-center rounded-full border border-slate-200 bg-white px-4 text-[13px] font-medium text-slate-800 transition-colors hover:bg-slate-50 sm:inline-flex"
            >
              Browse services
            </Link>
            <Link
              href="/profile"
              aria-label="Your profile"
              className="relative flex size-9 items-center justify-center overflow-hidden rounded-full bg-slate-900 text-[11px] font-semibold text-white"
            >
              {user.image ? (
                <Image
                  src={user.image}
                  alt=""
                  width={36}
                  height={36}
                  unoptimized
                  className="size-full object-cover"
                />
              ) : (
                getInitials(user.name)
              )}
            </Link>
          </div>
        </header>

        <nav
          aria-label="Dashboard"
          className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3 lg:hidden"
        >
          {links.map((link) => {
            const active = isLinkActive(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium",
                  active
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 text-slate-600",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          <div className="container mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
