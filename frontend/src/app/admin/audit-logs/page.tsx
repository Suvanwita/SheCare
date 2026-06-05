"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Filter,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import type { AdminAuditLog } from "../../../services/adminAuditLog.service";
import { useAdminAuditLogStore } from "../../../store/adminAuditLogStore";

const actionOptions = [
  { label: "All actions", value: "all" },
  { label: "POST", value: "admin:post" },
  { label: "PATCH", value: "admin:patch" },
  { label: "DELETE", value: "admin:delete" },
  { label: "PUT", value: "admin:put" },
];

const entityOptions = [
  { label: "All entities", value: "all" },
  { label: "Admin", value: "admin" },
  { label: "Articles", value: "admin/articles" },
  { label: "Doctors", value: "admin/doctors" },
  { label: "Users", value: "admin/users" },
  { label: "Reports", value: "admin/reports" },
  { label: "Notifications", value: "admin/notifications" },
];

const formatDateTime = (value?: string) => {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const getUserLabel = (log: AdminAuditLog) => {
  if (!log.user) {
    return "Unknown admin";
  }

  if (typeof log.user === "string") {
    return log.user;
  }

  return `${log.user.fullName} (${log.user.email})`;
};

export default function AdminAuditLogsPage() {
  const auditLogs = useAdminAuditLogStore((state) => state.auditLogs);
  const pagination = useAdminAuditLogStore((state) => state.pagination);
  const filters = useAdminAuditLogStore((state) => state.filters);
  const isLoading = useAdminAuditLogStore((state) => state.isLoading);
  const error = useAdminAuditLogStore((state) => state.error);
  const fetchAuditLogs = useAdminAuditLogStore((state) => state.fetchAuditLogs);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const visibleRange = useMemo(() => {
    if (!pagination.total) {
      return "0";
    }

    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(pagination.page * pagination.limit, pagination.total);

    return `${start}-${end}`;
  }, [pagination]);

  const applyFilters = () => {
    fetchAuditLogs({
      ...localFilters,
      page: 1,
    });
  };

  const clearFilters = () => {
    const nextFilters = {
      action: "all",
      entity: "all",
      user: "",
      startDate: "",
      endDate: "",
      page: 1,
      limit: 20,
    };

    setLocalFilters(nextFilters);
    fetchAuditLogs(nextFilters);
  };

  return (
    <section className="space-y-5">
      <div className="glass-card rounded-lg p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ClipboardList className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Admin Module
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-foreground">
                Audit Logs
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Review successful admin write actions, including who ran them,
                which route was touched, and when the change happened.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchAuditLogs()}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-bold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          {error}
        </div>
      ) : null}

      <div className="glass-card rounded-lg p-5">
        <div className="flex items-center gap-2 text-sm font-black text-foreground">
          <Filter className="h-4 w-4 text-primary" />
          Filters
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <select
            value={localFilters.action || "all"}
            onChange={(event) =>
              setLocalFilters((current) => ({
                ...current,
                action: event.target.value,
              }))
            }
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
          >
            {actionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={localFilters.entity || "all"}
            onChange={(event) =>
              setLocalFilters((current) => ({
                ...current,
                entity: event.target.value,
              }))
            }
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
          >
            {entityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            value={localFilters.user || ""}
            onChange={(event) =>
              setLocalFilters((current) => ({
                ...current,
                user: event.target.value,
              }))
            }
            placeholder="User id"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
          />

          <label className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <input
              type="date"
              value={localFilters.startDate || ""}
              onChange={(event) =>
                setLocalFilters((current) => ({
                  ...current,
                  startDate: event.target.value,
                }))
              }
              className="w-full bg-transparent text-foreground outline-none"
            />
          </label>

          <label className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <input
              type="date"
              value={localFilters.endDate || ""}
              onChange={(event) =>
                setLocalFilters((current) => ({
                  ...current,
                  endDate: event.target.value,
                }))
              }
              className="w-full bg-transparent text-foreground outline-none"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-border px-4 py-2 text-sm font-bold text-foreground transition hover:bg-muted"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={applyFilters}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            Apply Filters
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden rounded-lg">
        <div className="flex flex-col gap-2 border-b border-border px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-black text-foreground">Admin Write History</h2>
            <p className="text-sm text-muted-foreground">
              Showing {visibleRange} of {pagination.total} logs
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Read-only
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/40">
              <tr>
                {["Time", "Admin", "Action", "Entity", "Route", "IP"].map((header) => (
                  <th
                    key={header}
                    className="px-5 py-3 text-left text-xs font-black uppercase tracking-wide text-muted-foreground"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm font-semibold text-muted-foreground">
                    Loading audit logs...
                  </td>
                </tr>
              ) : auditLogs.length ? (
                auditLogs.map((log) => (
                  <tr key={log._id} className="transition hover:bg-muted/30">
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="min-w-64 px-5 py-4 text-sm font-semibold text-foreground">
                      {getUserLabel(log)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {log.entity}
                    </td>
                    <td className="min-w-72 px-5 py-4 text-sm text-muted-foreground">
                      {log.metadata?.path || "Unknown route"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
                      {log.ipAddress || "Unknown"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm font-semibold text-muted-foreground">
                    No audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {Math.max(pagination.pages, 1)}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1 || isLoading}
              onClick={() => fetchAuditLogs({ page: pagination.page - 1 })}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-bold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.pages || isLoading}
              onClick={() => fetchAuditLogs({ page: pagination.page + 1 })}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-bold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
