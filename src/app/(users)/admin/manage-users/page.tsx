import { Suspense } from "react";

import { fetchAllUsers, type DashboardUser } from "@/lib/dashboard-data";
import { requireRole } from "@/lib/session";
import { PageHeading } from "../../components/dashboard-ui";
import ManageUsersTable from "./ManageUsersTable";

async function UsersContent() {
  const session = await requireRole("admin");

  let users: DashboardUser[] = [];

  try {
    users = await fetchAllUsers();
  } catch (error) {
    console.error("Could not load users:", error);

    return (
      <p
        role="alert"
        className="rounded-xl border border-rose-200 bg-white p-5 text-sm text-rose-700"
      >
        Users are temporarily unavailable. Please try again later.
      </p>
    );
  }

  return (
    <ManageUsersTable users={users} currentUserId={session.user.id} />
  );
}

function UsersSkeleton() {
  return (
    <div className="h-80 animate-pulse rounded-xl bg-white" role="status" aria-label="Loading users" />
  );
}

export default function ManageUsersPage() {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Manage users"
        description="Update marketplace roles. Admin accounts keep their access level and cannot be changed."
      />
      <Suspense fallback={<UsersSkeleton />}>
        <UsersContent />
      </Suspense>
    </div>
  );
}
