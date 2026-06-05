"use client";

import { FormEvent, useEffect, useState } from "react";
import { Bell, Send } from "lucide-react";
import { useAdminNotificationStore } from "../../../store/adminNotificationStore";
import { formatDate } from "../../../lib/utils";

function recipient(user: unknown) {
  if (typeof user === "string") return user;
  if (user && typeof user === "object" && "fullName" in user) return String(user.fullName || "User");
  return "User";
}

export default function AdminNotificationsPage() {
  const notifications = useAdminNotificationStore((s) => s.notifications);
  const pagination = useAdminNotificationStore((s) => s.pagination);
  const isLoading = useAdminNotificationStore((s) => s.isLoading);
  const isSubmitting = useAdminNotificationStore((s) => s.isSubmitting);
  const error = useAdminNotificationStore((s) => s.error);
  const message = useAdminNotificationStore((s) => s.message);
  const fetchNotifications = useAdminNotificationStore((s) => s.fetchNotifications);
  const createAnnouncement = useAdminNotificationStore((s) => s.createAnnouncement);
  const [target, setTarget] = useState<"global" | "users">("global");
  const [userIdsText, setUserIdsText] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => { fetchNotifications({ page: 1, limit: 10 }); }, [fetchNotifications]);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await createAnnouncement({
      target,
      title,
      message: body,
      userIds: userIdsText.split(",").map((id) => id.trim()).filter(Boolean),
    });
    setTitle("");
    setBody("");
    setUserIdsText("");
  };

  return <section className="space-y-5">
    <div className="glass-card rounded-lg p-5"><div className="flex items-start gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Bell className="h-6 w-6" /></span><div><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Admin Module</p><h1 className="mt-1 text-3xl font-black">Notifications</h1><p className="mt-2 text-sm text-muted-foreground">Send announcements and review notification history.</p></div></div></div>
    <form onSubmit={submit} className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="space-y-1.5"><span className="text-xs font-bold text-muted-foreground">Target</span><select value={target} onChange={(e) => setTarget(e.target.value as "global" | "users")} className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm"><option value="global">Global active users</option><option value="users">Selected users</option></select></label>
        <label className="space-y-1.5"><span className="text-xs font-bold text-muted-foreground">User IDs</span><input value={userIdsText} onChange={(e) => setUserIdsText(e.target.value)} disabled={target === "global"} placeholder="comma separated user IDs" className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm disabled:opacity-50" /></label>
        <label className="space-y-1.5 lg:col-span-2"><span className="text-xs font-bold text-muted-foreground">Title</span><input value={title} onChange={(e) => setTitle(e.target.value)} required className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm" /></label>
        <label className="space-y-1.5 lg:col-span-2"><span className="text-xs font-bold text-muted-foreground">Message</span><textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm" /></label>
      </div>
      <button disabled={isSubmitting} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"><Send className="h-4 w-4" /> Send announcement</button>
    </form>
    {error ? <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive">{error}</div> : null}
    {message ? <div className="rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm font-semibold text-primary">{message}</div> : null}
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[56rem] text-left text-sm"><thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3">Title</th><th className="px-4 py-3">Recipient</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Read</th><th className="px-4 py-3">Sent</th></tr></thead><tbody>{isLoading ? <tr><td colSpan={5} className="px-4 py-10 text-center font-semibold text-muted-foreground">Loading notifications...</td></tr> : null}{!isLoading && notifications.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center font-semibold text-muted-foreground">No notifications found.</td></tr> : null}{!isLoading && notifications.map((n) => <tr key={n._id} className="border-b border-border/70 last:border-0"><td className="px-4 py-4"><p className="font-bold text-foreground">{n.title}</p><p className="text-xs text-muted-foreground">{n.message || "No message"}</p></td><td className="px-4 py-4 text-muted-foreground">{recipient(n.user)}</td><td className="px-4 py-4 text-muted-foreground">{n.type}</td><td className="px-4 py-4"><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">{n.isRead ? "Read" : "Unread"}</span></td><td className="px-4 py-4 text-muted-foreground">{n.createdAt ? formatDate(n.createdAt) : "Unknown"}</td></tr>)}</tbody></table></div></div>
    <div className="flex justify-between text-sm text-muted-foreground"><span>Page {pagination.page} of {Math.max(pagination.pages, 1)} · {pagination.total}</span><div className="flex gap-2"><button disabled={pagination.page <= 1} onClick={() => fetchNotifications({ page: pagination.page - 1 })} className="rounded-xl border border-border px-3 py-2 disabled:opacity-50">Previous</button><button disabled={pagination.page >= pagination.pages} onClick={() => fetchNotifications({ page: pagination.page + 1 })} className="rounded-xl border border-border px-3 py-2 disabled:opacity-50">Next</button></div></div>
  </section>;
}
