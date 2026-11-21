import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route-level loading UI.
 *
 * Instead of a centered spinner, this mirrors the shape of a typical page
 * (header, summary cards, list) so the layout doesn't jump when content lands.
 * Swap the blocks below to match your real page.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      // Wait 200ms before showing anything, so fast navigations never flash a skeleton.
      className="mx-auto w-full max-w-5xl space-y-8 p-6 animate-in fade-in duration-300 delay-200 fill-mode-backwards"
    >
      <span className="sr-only">Loading content…</span>

      {/* Page header */}
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4 rounded-xl border bg-card p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>

      {/* List / table rows */}
      <div className="divide-y rounded-xl border bg-card">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="hidden h-6 w-16 rounded-full sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}