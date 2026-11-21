import { Suspense } from "react";

import { requireRole } from "@/lib/session";
import { PageHeading } from "../../components/dashboard-ui";
import SettingsForm from "./SettingsForm";

export default async function AdminSettingsPage() {
  await requireRole("admin");

  return (
    <div className="space-y-6">
      <PageHeading
        title="Settings"
        description="Add custom repair categories and service modes for technician listings."
      />
      <Suspense fallback={<div className="h-72 animate-pulse rounded-xl bg-white" />}>
        <SettingsForm />
      </Suspense>
    </div>
  );
}
