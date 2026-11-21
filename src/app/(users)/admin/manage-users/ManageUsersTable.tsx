"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from "@/components/ui/toast";
import type { DashboardUser } from "@/lib/dashboard-data";
import { normalizeStatus } from "../../components/dashboard-ui";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatJoined(value?: string) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function ManageUsersTable({
  users,
  currentUserId,
}: {
  users: DashboardUser[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function changeRole(id: string, role: string) {
    setSavingId(id);

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not update the role.");
      }

      toast.add({
        title: "Role updated",
        description: `This account is now a ${role}.`,
        type: "success",
      });
      router.refresh();
    } catch (error) {
      toast.add({
        title: "Update failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        type: "error",
      });
    } finally {
      setSavingId(null);
    }
  }

  async function deleteUser(id: string) {
    setSavingId(id);

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not delete the user.");
      }

      toast.add({
        title: "User deleted",
        description: "The user account was removed.",
        type: "success",
      });
      setDeleteId(null);
      router.refresh();
    } catch (error) {
      toast.add({
        title: "Delete failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        type: "error",
      });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-5">
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-semibold tracking-[0.06em] text-slate-500 uppercase">
              <th className="px-6 py-3.5 font-semibold">User</th>
              <th className="px-6 py-3.5 font-semibold">Email</th>
              <th className="px-6 py-3.5 font-semibold">Role</th>
              <th className="px-6 py-3.5 font-semibold">Joined</th>
              <th className="px-6 py-3.5 font-semibold">Change role</th>
              <th className="px-6 py-3.5 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const role = normalizeStatus(user.role) || "customer";
              const isCurrentUser = user._id === currentUserId;

              return (
                <tr key={user._id} className="text-[13.5px] text-slate-700">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-semibold text-blue-700">
                        {getInitials(user.name)}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {user.name}
                        {isCurrentUser ? " (you)" : ""}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-slate-600">{user.email}</td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 capitalize">
                      {role}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-slate-600">
                    {formatJoined(user.createdAt)}
                  </td>
                  <td className="px-6 py-5">
                    {isCurrentUser ? (
                      <span className="text-[13px] text-slate-500">You cannot change your own role</span>
                    ) : (
                      <select
                        value={role}
                        disabled={savingId === user._id}
                        onChange={(event) => changeRole(user._id, event.target.value)}
                        className="h-10 w-full max-w-[184px] rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 outline-none focus:border-blue-400 disabled:opacity-60"
                      >
                        <option value="customer">Customer</option>
                        <option value="technician">Technician</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {isCurrentUser ? (
                      <span className="text-[13px] text-slate-400">Protected</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteId(user._id)}
                        disabled={savingId === user._id}
                        className="h-9 rounded-full border border-rose-200 px-4 text-[12.5px] font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {users.length === 0 ? (
        <p className="px-6 py-10 text-center text-[13px] text-slate-500">
          No users found.
        </p>
      ) : null}
    </div>

      {deleteId ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-user-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 id="delete-user-title" className="text-lg font-semibold text-slate-900">
              Delete this user?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              This removes the user account from FixMate data. Existing service and booking history may remain.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="h-10 rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteUser(deleteId)}
                disabled={savingId === deleteId}
                className="h-10 rounded-full bg-rose-600 px-5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {savingId === deleteId ? "Deleting…" : "Delete user"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
