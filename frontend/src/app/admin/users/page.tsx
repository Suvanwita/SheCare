"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  CheckCircle2,
  Eye,
  KeyRound,
  Search,
  ShieldAlert,
  Trash2,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import type { AuthRole } from "../../../services/auth.service";
import type { AdminUser, AdminUserSession } from "../../../services/adminUser.service";
import { useAdminUserStore } from "../../../store/adminUserStore";
import { useAuthStore } from "../../../store/authStore";
import { formatDate } from "../../../lib/utils";

type ConfirmationAction = "deactivate" | "delete" | "revoke";

function getUserId(user: { _id?: string; id?: string } | null) {
  return user?._id || user?.id || "";
}

function getRoleBadgeClass(role: AuthRole) {
  if (role === "admin") {
    return "bg-primary/10 text-primary";
  }

  if (role === "doctor") {
    return "bg-secondary/10 text-secondary";
  }

  return "bg-muted text-muted-foreground";
}

function SessionsDrawer({
  user,
  sessions,
  isLoading,
  isSubmitting,
  onClose,
  onRevoke,
}: {
  user: AdminUser | null;
  sessions: AdminUserSession[];
  isLoading: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onRevoke: () => void;
}) {
  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/30 backdrop-blur-sm">
      <aside className="h-full w-full max-w-xl overflow-y-auto border-l border-border bg-card p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Active sessions
            </p>
            <h2 className="mt-1 text-2xl font-black text-foreground">
              {user.fullName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close sessions drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={onRevoke}
          disabled={isSubmitting || sessions.every((session) => session.isRevoked)}
          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-destructive px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <KeyRound className="h-4 w-4" />
          Revoke sessions
        </button>

        <div className="mt-6 space-y-3">
          {isLoading ? (
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm font-semibold text-muted-foreground">
              Loading sessions...
            </div>
          ) : null}

          {!isLoading && sessions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm font-semibold text-muted-foreground">
              No sessions found for this user.
            </div>
          ) : null}

          {!isLoading &&
            sessions.map((session) => (
              <article
                key={session._id}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-foreground">
                      {session.userAgent || "Unknown device"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      IP {session.ipAddress || "unknown"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      session.isRevoked
                        ? "bg-muted text-muted-foreground"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {session.isRevoked ? "Revoked" : "Active"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Expires {formatDate(session.expiresAt)}
                </p>
              </article>
            ))}
        </div>
      </aside>
    </div>
  );
}

export default function AdminUsersPage() {
  const users = useAdminUserStore((state) => state.users);
  const sessions = useAdminUserStore((state) => state.sessions);
  const sessionUser = useAdminUserStore((state) => state.sessionUser);
  const pagination = useAdminUserStore((state) => state.pagination);
  const filters = useAdminUserStore((state) => state.filters);
  const isLoading = useAdminUserStore((state) => state.isLoading);
  const isSubmitting = useAdminUserStore((state) => state.isSubmitting);
  const isLoadingSessions = useAdminUserStore((state) => state.isLoadingSessions);
  const error = useAdminUserStore((state) => state.error);
  const fetchUsers = useAdminUserStore((state) => state.fetchUsers);
  const updateRole = useAdminUserStore((state) => state.updateRole);
  const activateUser = useAdminUserStore((state) => state.activateUser);
  const deactivateUser = useAdminUserStore((state) => state.deactivateUser);
  const deleteUser = useAdminUserStore((state) => state.deleteUser);
  const fetchSessions = useAdminUserStore((state) => state.fetchSessions);
  const revokeSessions = useAdminUserStore((state) => state.revokeSessions);
  const clearSessions = useAdminUserStore((state) => state.clearSessions);
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = getUserId(currentUser);
  const [search, setSearch] = useState(filters.search ?? "");
  const [role, setRole] = useState<AuthRole | "all">(filters.role ?? "all");
  const [activeFilter, setActiveFilter] = useState(filters.isActive ?? "all");
  const [confirmation, setConfirmation] = useState<{
    action: ConfirmationAction;
    user: AdminUser;
  } | null>(null);

  useEffect(() => {
    fetchUsers({ page: 1, limit: 10 });
  }, [fetchUsers]);

  const applyFilters = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    fetchUsers({
      search: search.trim(),
      role,
      isActive: activeFilter,
      page: 1,
    });
  };

  const isCurrentAdmin = (user: AdminUser) => user._id === currentUserId;

  const runConfirmation = async () => {
    if (!confirmation) {
      return;
    }

    if (confirmation.action === "deactivate") {
      await deactivateUser(confirmation.user._id);
    }

    if (confirmation.action === "delete") {
      await deleteUser(confirmation.user._id);
    }

    if (confirmation.action === "revoke") {
      await revokeSessions(confirmation.user._id);
    }

    setConfirmation(null);
  };

  return (
    <section className="space-y-5">
      <div className="glass-card rounded-lg p-5">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Admin Module
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-foreground">
              Users
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Manage account access, roles, activation status, and active sessions.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={applyFilters}
        className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-sm lg:grid-cols-[1fr_12rem_12rem_auto]"
      >
        <label className="relative">
          <span className="sr-only">Search users</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or email..."
            className="h-11 w-full rounded-2xl border border-input bg-background pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </label>
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as AuthRole | "all")}
          className="h-11 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
        >
          <option value="all">All roles</option>
          <option value="user">User</option>
          <option value="doctor">Doctor</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={activeFilter}
          onChange={(event) =>
            setActiveFilter(event.target.value as "all" | "true" | "false")
          }
          className="h-11 rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary"
        >
          <option value="all">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button
          type="submit"
          className="h-11 rounded-2xl border border-border bg-foreground px-5 text-sm font-bold text-background transition-colors hover:bg-foreground/90"
        >
          Apply
        </button>
      </form>

      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[68rem] text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Last login</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center font-semibold text-muted-foreground">
                    Loading users...
                  </td>
                </tr>
              ) : null}

              {!isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center font-semibold text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : null}

              {!isLoading &&
                users.map((user) => {
                  const isSelf = isCurrentAdmin(user);

                  return (
                    <tr key={user._id} className="border-b border-border/70 last:border-0">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-bold text-foreground">{user.fullName}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${getRoleBadgeClass(user.role)}`}
                          >
                            {user.role}
                          </span>
                          <select
                            value={user.role}
                            disabled={isSubmitting}
                            onChange={(event) =>
                              updateRole(user._id, event.target.value as AuthRole)
                            }
                            className="h-9 rounded-xl border border-input bg-background px-2 text-xs font-bold outline-none focus:border-primary"
                          >
                            <option value="user">User</option>
                            <option value="doctor">Doctor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        {isSelf ? (
                          <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
                            You cannot remove your own admin role.
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                            user.isActive
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {user.isActive ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {user.createdAt ? formatDate(user.createdAt) : "Unknown"}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Never"}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => fetchSessions(user._id)}
                            className="rounded-xl border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label="View sessions"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={isSubmitting || isSelf}
                            onClick={() =>
                              user.isActive
                                ? setConfirmation({ action: "deactivate", user })
                                : activateUser(user._id)
                            }
                            className="rounded-xl border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={user.isActive ? "Deactivate user" : "Activate user"}
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={isSubmitting || isSelf}
                            onClick={() => setConfirmation({ action: "delete", user })}
                            className="rounded-xl border border-border p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Soft delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Page {pagination.page} of {Math.max(pagination.pages, 1)} · {pagination.total} users
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pagination.page <= 1 || isLoading}
            onClick={() => fetchUsers({ page: pagination.page - 1 })}
            className="rounded-xl border border-border px-3 py-2 font-bold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={pagination.page >= pagination.pages || isLoading}
            onClick={() => fetchUsers({ page: pagination.page + 1 })}
            className="rounded-xl border border-border px-3 py-2 font-bold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <SessionsDrawer
        user={sessionUser}
        sessions={sessions}
        isLoading={isLoadingSessions}
        isSubmitting={isSubmitting}
        onClose={clearSessions}
        onRevoke={() => {
          if (sessionUser) {
            setConfirmation({ action: "revoke", user: sessionUser });
          }
        }}
      />

      {confirmation ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="rounded-2xl bg-destructive/10 p-2 text-destructive">
                <ShieldAlert className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-black text-foreground">
                  Confirm admin action
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {confirmation.action === "deactivate" &&
                    `Deactivate ${confirmation.user.fullName}? Their sessions will be revoked.`}
                  {confirmation.action === "delete" &&
                    `Soft delete ${confirmation.user.fullName}? Their account will become inactive.`}
                  {confirmation.action === "revoke" &&
                    `Revoke all sessions for ${confirmation.user.fullName}?`}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmation(null)}
                className="rounded-2xl border border-border px-4 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={runConfirmation}
                className="rounded-2xl bg-destructive px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Working..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
