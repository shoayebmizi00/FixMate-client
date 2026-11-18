"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react";

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
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const user = session?.user;

  async function handleSignOut() {
    await signOut();
    router.refresh();
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
          {navLinks.map((link) => {
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
          {isPending ? (
            <div className="size-10 animate-pulse rounded-full bg-slate-100" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 rounded-full border border-slate-200 bg-white py-1.5 pr-3 pl-1.5 shadow-xs transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-600/30 focus-visible:outline-none">
                <Avatar className="size-8">
                  {user.image ? (
                    <AvatarImage src={user.image} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="bg-slate-200 text-[11px] font-semibold text-slate-700">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[140px] truncate text-sm font-medium text-slate-800 sm:block">
                  {user.name}
                </span>
                <ChevronDown className="size-4 text-slate-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="flex flex-col gap-0.5 px-2 py-1.5">
                    <span className="truncate text-sm font-medium text-foreground">
                      {user.name}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {user.role === "technician" ? "Technician" : "User"}
                    </span>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/dashboard" />}>
                  <LayoutDashboard />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                  <LogOut />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/signin"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "hidden h-10 px-4 text-slate-700 sm:inline-flex"
                )}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
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
    </header>
  );
}
