import { Suspense } from "react";

import { requireRole } from "@/lib/session";
import { PageHeading } from "../../../components/dashboard-ui";
import AddServiceForm from "./AddServiceForm";

async function NewServiceContent() {
  await requireRole("technician");

  return <AddServiceForm />;
}

function NewServiceSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading form">
      <div className="h-20 animate-pulse rounded-xl bg-white" />
      <div className="h-[560px] animate-pulse rounded-xl bg-white" />
    </div>
  );
}

export default function NewTechnicianServicePage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Add a service"
        description="Describe the repair you offer. It will be linked to your technician account and sent for admin approval."
      />
      <Suspense fallback={<NewServiceSkeleton />}>
        <NewServiceContent />
      </Suspense>
    </div>
  );
}
