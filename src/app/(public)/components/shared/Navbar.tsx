"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";

import logo from "@/assets/logo.png";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Technicians", href: "/technicians" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "About", href: "/about" },
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

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = session?.user;
  const visibleNavLinks =
    user?.role === "technician"
      ? navLinks.filter(
          (link) => link.href !== "/services" && link.href !== "/technicians"
        )
      : navLinks;

  async function handleSignOut() {
    try {
      await signOut();
    } finally {
      window.location.reload();
    }
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="container mx-auto flex h-[72px] items-center justify-between gap-6 px-4 sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-8">
        <Link href="/" className="flex items-center gap-3">
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
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-10 lg:flex">
          {visibleNavLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(`${link.href}/`));

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative py-1 text-[15px] font-medium transition-colors",
                  isActive
                    ? "text-slate-900 after:absolute after:inset-x-0 after:-bottom-1.5 after:h-0.5 after:rounded-full after:bg-blue-600"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 lg:justify-self-end">
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="grid size-10 place-items-center rounded-full border border-slate-200 text-slate-700 lg:hidden"
          >
            {mobileMenuOpen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>

          {isPending ? (
            <div className="size-10 animate-pulse rounded-full bg-slate-100" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1.5 pr-2.5 pl-1.5 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-600/30 focus-visible:outline-none">
                <Avatar className="size-9 ring-2 ring-white">
                  {user.image ? (
                    <AvatarImage src={user.image} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="bg-blue-50 text-[11px] font-semibold text-blue-700">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[140px] truncate text-sm font-medium text-slate-800 sm:block">
                  {user.name}
                </span>
                <ChevronDown className="size-4 text-slate-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="w-[280px] rounded-2xl border-slate-200 p-2 shadow-[0_16px_40px_rgba(15,23,42,0.14)]"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-2 py-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-11">
                        {user.image ? (
                          <AvatarImage src={user.image} alt={user.name} />
                        ) : null}
                        <AvatarFallback className="bg-blue-50 text-sm font-semibold text-blue-700">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {user.name}
                        </p>
                        <span
                          className={cn(
                            "mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                            user.role === "admin"
                              ? "bg-violet-50 text-violet-700"
                              : user.role === "technician"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-blue-50 text-blue-700"
                          )}
                        >
                          {user.role === "admin"
                            ? "Admin"
                            : user.role === "technician"
                              ? "Technician"
                              : "Customer"}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={<Link href="/dashboard" />}
                  className="h-11 rounded-lg px-3 text-sm text-slate-700"
                >
                  <span className="grid size-8 place-items-center rounded-lg bg-slate-100 text-slate-700">
                    <LayoutDashboard className="size-4" />
                  </span>
                  <span className="font-medium">Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href="/dashboard/profile" />}
                  className="h-11 rounded-lg px-3 text-sm text-slate-700"
                >
                  <span className="grid size-8 place-items-center rounded-lg bg-slate-100 text-slate-700">
                    <User className="size-4" />
                  </span>
                  <span className="font-medium">Update profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={handleSignOut}
                  className="h-11 rounded-lg px-3 text-sm"
                >
                  <span className="grid size-8 place-items-center rounded-lg bg-rose-50 text-rose-600">
                    <LogOut className="size-4" />
                  </span>
                  <span className="font-medium">Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/sign-in"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "hidden h-10 px-4 text-slate-700 sm:inline-flex"
                )}
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-10 rounded-full px-5"
                )}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-lg lg:hidden">
          <nav aria-label="Mobile navigation" className="container mx-auto space-y-1">
            {visibleNavLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(`${link.href}/`));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "block rounded-lg px-4 py-3 text-sm font-medium",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            {user ? (
              <>
                <div className="my-2 border-t border-slate-100" />
                <Link
                  href="/dashboard"
                  onClick={closeMobileMenu}
                  className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  onClick={closeMobileMenu}
                  className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Update profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    void handleSignOut();
                  }}
                  className="block w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                <Link
                  href="/sign-in"
                  onClick={closeMobileMenu}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 text-sm font-semibold text-slate-700"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  onClick={closeMobileMenu}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white"
                >
                  Sign up
                </Link>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
