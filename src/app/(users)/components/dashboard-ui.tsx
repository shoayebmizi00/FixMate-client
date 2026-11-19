import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function formatMoney(value?: number) {
  const amount = typeof value === "number" ? value : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function normalizeStatus(value?: string) {
  return (value ?? "").toLowerCase().replaceAll("_", " ").replaceAll("-", " ").trim();
}

export function humanize(value?: string) {
  const text = normalizeStatus(value);
  if (!text) return "Unknown";

  return text.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const badgeBase =
  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap";

const statusColors: Record<string, string> = {
  requested: "border-blue-200 bg-blue-50 text-blue-700",
  accepted: "border-indigo-200 bg-indigo-50 text-indigo-700",
  "in progress": "border-amber-200 bg-amber-50 text-amber-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
  cancelled: "border-slate-200 bg-slate-100 text-slate-600",
};

export function StatusBadge({ status }: { status?: string }) {
  const key = normalizeStatus(status);

  return (
    <span className={cn(badgeBase, statusColors[key] ?? statusColors.cancelled)}>
      {humanize(status)}
    </span>
  );
}

export function PaymentBadge({ status }: { status?: string }) {
  const key = normalizeStatus(status);
  const paid = key === "paid" || key === "verified";

  return (
    <span
      className={cn(
        badgeBase,
        paid
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      )}
    >
      {paid ? "Paid" : "Unpaid"}
    </span>
  );
}

export function ApprovalBadge({ status }: { status?: string }) {
  const key = normalizeStatus(status);

  const color =
    key === "approved"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : key === "rejected"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

  const label =
    key === "approved" ? "Approved" : key === "rejected" ? "Rejected" : "Pending Approval";

  return <span className={cn(badgeBase, color)}>{label}</span>;
}

export function RoleBadge({ role }: { role?: string }) {
  return (
    <span className={cn(badgeBase, "border-slate-200 bg-slate-100 text-slate-700")}>
      {humanize(role ?? "customer")}
    </span>
  );
}

export function PageHeading({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div>
      <h1 className="text-[28px] leading-tight font-bold tracking-tight text-slate-900 sm:text-[30px]">
        {title}
      </h1>
      <p className="mt-2 text-[14px] leading-relaxed text-slate-500 sm:text-[15px]">
        {description}
      </p>
      {children}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
        {icon}
      </span>
      <h2 className="mt-4 text-base font-semibold text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-[420px] text-[13px] leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  );
}
