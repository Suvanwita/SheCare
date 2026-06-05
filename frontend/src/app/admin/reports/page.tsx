"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Eye, FileText, Search, Trash2, X } from "lucide-react";
import type { AdminReport } from "../../../services/adminReport.service";
import { useAdminReportStore } from "../../../store/adminReportStore";
import { formatDate } from "../../../lib/utils";

function owner(report: AdminReport) {
  return typeof report.user === "string" ? report.user : report.user.fullName || report.user.email || "User";
}

export default function AdminReportsPage() {
  const reports = useAdminReportStore((s) => s.reports);
  const selectedReport = useAdminReportStore((s) => s.selectedReport);
  const pagination = useAdminReportStore((s) => s.pagination);
  const isLoading = useAdminReportStore((s) => s.isLoading);
  const isSubmitting = useAdminReportStore((s) => s.isSubmitting);
  const error = useAdminReportStore((s) => s.error);
  const fetchReports = useAdminReportStore((s) => s.fetchReports);
  const fetchReport = useAdminReportStore((s) => s.fetchReport);
  const deleteReport = useAdminReportStore((s) => s.deleteReport);
  const clearSelected = useAdminReportStore((s) => s.clearSelected);
  const [user, setUser] = useState("");
  const [category, setCategory] = useState("all");
  const [mimeType, setMimeType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminReport | null>(null);
  const categories = useMemo(() => ["all", ...Array.from(new Set(reports.map((r) => r.category).filter(Boolean)))], [reports]);

  useEffect(() => { fetchReports({ page: 1, limit: 10 }); }, [fetchReports]);
  const applyFilters = (e?: FormEvent<HTMLFormElement>) => { e?.preventDefault(); fetchReports({ user, category, mimeType, startDate, endDate, page: 1 }); };

  return <section className="space-y-5">
    <div className="glass-card rounded-lg p-5"><div className="flex items-start gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><FileText className="h-6 w-6" /></span><div><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Admin Module</p><h1 className="mt-1 text-3xl font-black">Reports</h1><p className="mt-2 text-sm text-muted-foreground">Review report metadata and remove unsafe or invalid uploads.</p></div></div></div>
    <form onSubmit={applyFilters} className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-sm xl:grid-cols-[1fr_12rem_12rem_10rem_10rem_auto]"><label className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={user} onChange={(e) => setUser(e.target.value)} placeholder="User ID" className="h-11 w-full rounded-2xl border border-input bg-background pl-10 pr-4 text-sm" /></label><select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 rounded-2xl border border-input bg-background px-4 text-sm">{categories.map((c) => <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>)}</select><select value={mimeType} onChange={(e) => setMimeType(e.target.value)} className="h-11 rounded-2xl border border-input bg-background px-4 text-sm"><option value="all">All files</option><option value="application/pdf">PDF</option><option value="image/jpeg">JPG</option><option value="image/png">PNG</option></select><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-11 rounded-2xl border border-input bg-background px-4 text-sm" /><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-11 rounded-2xl border border-input bg-background px-4 text-sm" /><button className="h-11 rounded-2xl bg-foreground px-5 text-sm font-bold text-background">Apply</button></form>
    {error ? <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm font-semibold text-destructive">{error}</div> : null}
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[62rem] text-left text-sm"><thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3">Report</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Uploaded</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody>{isLoading ? <tr><td colSpan={5} className="px-4 py-10 text-center font-semibold text-muted-foreground">Loading reports...</td></tr> : null}{!isLoading && reports.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center font-semibold text-muted-foreground">No reports found.</td></tr> : null}{!isLoading && reports.map((r) => <tr key={r._id} className="border-b border-border/70 last:border-0"><td className="px-4 py-4"><p className="font-bold text-foreground">{r.title}</p><p className="text-xs text-muted-foreground">{r.category || "Uncategorized"}</p></td><td className="px-4 py-4 text-muted-foreground">{owner(r)}</td><td className="px-4 py-4 text-muted-foreground">{r.mimeType || "Unknown"}</td><td className="px-4 py-4 text-muted-foreground">{r.createdAt ? formatDate(r.createdAt) : "Unknown"}</td><td className="px-4 py-4"><div className="flex justify-end gap-2"><button onClick={() => fetchReport(r._id)} className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted"><Eye className="h-4 w-4" /></button><button onClick={() => setDeleteTarget(r)} className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div></div>
    <div className="flex justify-between text-sm text-muted-foreground"><span>Page {pagination.page} of {Math.max(pagination.pages, 1)} · {pagination.total}</span><div className="flex gap-2"><button disabled={pagination.page <= 1} onClick={() => fetchReports({ page: pagination.page - 1 })} className="rounded-xl border border-border px-3 py-2 disabled:opacity-50">Previous</button><button disabled={pagination.page >= pagination.pages} onClick={() => fetchReports({ page: pagination.page + 1 })} className="rounded-xl border border-border px-3 py-2 disabled:opacity-50">Next</button></div></div>
    {selectedReport ? <div className="fixed inset-0 z-50 flex justify-end bg-foreground/30 backdrop-blur-sm"><aside className="h-full w-full max-w-xl overflow-y-auto border-l border-border bg-card p-5 shadow-2xl"><button onClick={clearSelected} className="float-right rounded-xl p-2 text-muted-foreground hover:bg-muted"><X className="h-5 w-5" /></button><h2 className="text-2xl font-black">{selectedReport.title}</h2><div className="mt-6 space-y-3 text-sm text-muted-foreground"><p><b>Owner:</b> {owner(selectedReport)}</p><p><b>File:</b> {selectedReport.originalName || selectedReport.fileName || "Unknown"}</p><p><b>MIME:</b> {selectedReport.mimeType || "Unknown"}</p><p><b>Size:</b> {selectedReport.size ? `${Math.round(selectedReport.size / 1024)} KB` : "Unknown"}</p><p><b>Path:</b> {selectedReport.path || "Unknown"}</p><p><b>Notes:</b> {selectedReport.notes || "None"}</p></div></aside></div> : null}
    {deleteTarget ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 px-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-2xl"><h2 className="text-xl font-black">Delete report?</h2><p className="mt-2 text-sm text-muted-foreground">Remove “{deleteTarget.title}” and its local file if present.</p><div className="mt-5 flex justify-end gap-3"><button onClick={() => setDeleteTarget(null)} className="rounded-2xl border border-border px-4 py-2.5 text-sm font-bold">Cancel</button><button disabled={isSubmitting} onClick={async () => { await deleteReport(deleteTarget._id); setDeleteTarget(null); }} className="rounded-2xl bg-destructive px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">Delete</button></div></div></div> : null}
  </section>;
}
