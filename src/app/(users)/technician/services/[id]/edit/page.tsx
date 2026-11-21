import { notFound } from "next/navigation";

import { fetchAllServices } from "@/lib/dashboard-data";
import { requireRole } from "@/lib/session";
import EditServiceForm from "./EditServiceForm";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("technician");
  const { id } = await params;
  const services = await fetchAllServices();
  const service = services.find((item) =>
    item._id === id &&
    (item.technicianId === session.user.id ||
      item.technicianEmail?.toLowerCase() === session.user.email.toLowerCase())
  );

  if (!service) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-bold text-slate-900">Edit service</h1>
        <p className="mt-2 text-sm text-slate-500">Saving changes sends this listing back to pending approval.</p>
      </div>
      <EditServiceForm service={service} />
    </div>
  );
}
