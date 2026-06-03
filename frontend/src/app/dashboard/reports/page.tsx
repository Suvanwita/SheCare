"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Download,
  Eye,
  FileImage,
  FileText,
  Search,
  ShieldCheck,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { cn, formatDate } from "../../../lib/utils";
import { useReportStore } from "../../../store/reportStore";
import type { Report } from "../../../services/report.service";

type ReportFileType = "PDF" | "JPG" | "PNG";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const REPORT_CATEGORIES = [
  "Lab Report",
  "Ultrasound",
  "Prescription",
  "Hormone Panel",
  "Consultation Note",
  "Other",
];

const REPORT_FILE_TYPES: Array<{ label: ReportFileType; value: string }> = [
  { label: "PDF", value: "application/pdf" },
  { label: "JPG", value: "image/jpeg" },
  { label: "PNG", value: "image/png" },
];

function getFileType(file: File): ReportFileType | null {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return "PDF";
  }
  if (file.type === "image/jpeg" || file.name.toLowerCase().match(/\.(jpg|jpeg)$/)) {
    return "JPG";
  }
  if (file.type === "image/png" || file.name.toLowerCase().endsWith(".png")) {
    return "PNG";
  }
  return null;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getReportFileType(mimeType?: string): ReportFileType {
  if (mimeType === "application/pdf") {
    return "PDF";
  }

  if (mimeType === "image/png") {
    return "PNG";
  }

  return "JPG";
}

function getReportDate(report: Report) {
  return report.createdAt ?? report.updatedAt ?? new Date().toISOString();
}

function getIsoDate(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function ReportsDashboardPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(REPORT_CATEGORIES[0]);
  const [doctorName, setDoctorName] = useState("");
  const [notes, setNotes] = useState("");
  const [previewReport, setPreviewReport] = useState<Report | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [fileTypeFilter, setFileTypeFilter] = useState("all");
  const reports = useReportStore((state) => state.reports);
  const isLoading = useReportStore((state) => state.isLoading);
  const isSubmitting = useReportStore((state) => state.isSubmitting);
  const uploadProgress = useReportStore((state) => state.uploadProgress);
  const error = useReportStore((state) => state.error);
  const fetchReports = useReportStore((state) => state.fetchReports);
  const uploadReportToBackend = useReportStore((state) => state.uploadReport);
  const deleteReportFromBackend = useReportStore((state) => state.deleteReport);

  const doctorOptions = useMemo(
    () =>
      Array.from(
        new Set(
          reports
            .map((report) => report.doctorName)
            .filter((doctor): doctor is string => Boolean(doctor))
        )
      ),
    [reports]
  );

  const filteredReports = useMemo(
    () =>
      reports.filter((report) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !query ||
          report.title.toLowerCase().includes(query) ||
          (report.category ?? "").toLowerCase().includes(query) ||
          (report.doctorName ?? "").toLowerCase().includes(query) ||
          (report.originalName ?? "").toLowerCase().includes(query);
        const matchesDate = !dateFilter || getIsoDate(getReportDate(report)) === dateFilter;

        return matchesSearch && matchesDate;
      }),
    [dateFilter, reports, searchQuery]
  );

  useEffect(() => {
    fetchReports({
      page: 1,
      limit: 20,
      category: categoryFilter === "all" ? undefined : categoryFilter,
      doctorName: doctorFilter === "all" ? undefined : doctorFilter,
      mimeType: fileTypeFilter === "all" ? undefined : fileTypeFilter,
    });
  }, [categoryFilter, doctorFilter, fetchReports, fileTypeFilter]);

  const handleFile = (file: File | undefined) => {
    if (!file) {
      return;
    }

    const fileType = getFileType(file);
    if (!fileType) {
      setFileError("Only PDF, JPG, and PNG files are supported.");
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError("File size must be 5MB or less.");
      setSelectedFile(null);
      return;
    }

    setFileError("");
    setSelectedFile(file);
  };

  const clearUpload = () => {
    setSelectedFile(null);
    setFileError("");
  };

  const uploadReport = async () => {
    if (!selectedFile) {
      setFileError("Choose a PDF, JPG, or PNG report before uploading.");
      return;
    }

    const fileType = getFileType(selectedFile);
    if (!fileType) {
      setFileError("Only PDF, JPG, and PNG files are supported.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileError("File size must be 5MB or less.");
      return;
    }

    const reportTitle = title.trim() || selectedFile.name.replace(/\.[^/.]+$/, "");

    try {
      await uploadReportToBackend({
        file: selectedFile,
        title: reportTitle,
        category,
        doctorName: doctorName.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setTitle("");
      setCategory(REPORT_CATEGORIES[0]);
      setDoctorName("");
      setNotes("");
      setSelectedFile(null);
      setFileError("");
    } catch {
      // Store error state is rendered on the page.
    }
  };

  const deleteReport = async (id: string) => {
    try {
      await deleteReportFromBackend(id);
      if (previewReport?._id === id) {
        setPreviewReport(null);
      }
    } catch {
      // Store error state is rendered on the page.
    }
  };

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">
          SheCare documents
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">
          Medical Reports
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload, organize, and review your medical documents securely.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-black text-foreground">Upload report</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload PDF, JPG, or PNG reports to your SheCare record.
            </p>
          </div>

          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              handleFile(event.dataTransfer.files[0]);
            }}
            className="rounded-3xl border-2 border-dashed border-primary/25 bg-primary/5 p-6 text-center transition-colors hover:bg-primary/10"
          >
            <UploadCloud className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-3 text-sm font-black text-foreground">
              Drag and drop a report here
            </p>
            <p className="mt-1 text-xs text-muted-foreground">PDF, JPG, or PNG</p>
            <label className="mt-4 inline-flex cursor-pointer rounded-2xl bg-foreground px-4 py-2.5 text-xs font-bold text-background transition-opacity hover:opacity-90">
              Browse files
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="sr-only"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
            </label>
          </div>

          {fileError && (
            <p className="mt-3 text-xs font-semibold text-destructive">{fileError}</p>
          )}

          {selectedFile && (
            <div className="mt-4 rounded-3xl border border-border/60 bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {getFileType(selectedFile) === "PDF" ? (
                      <FileText className="h-5 w-5" />
                    ) : (
                      <FileImage className="h-5 w-5" />
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {getFileType(selectedFile)} · {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearUpload}
                  className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Remove selected file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
                  Upload progress: {uploadProgress}%
                </p>
              </div>
            </div>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                Report title
              </span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-2xl border border-border/80 bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40"
                placeholder="Hormone panel report"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                Category
              </span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-2xl border border-border/80 bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40"
              >
                {REPORT_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                Doctor name
              </span>
              <input
                value={doctorName}
                onChange={(event) => setDoctorName(event.target.value)}
                className="w-full rounded-2xl border border-border/80 bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40"
                placeholder="Dr. Anjali Rao"
              />
            </label>

            <label className="space-y-2 sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wide text-foreground/80">
                Notes
              </span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                className="w-full resize-none rounded-2xl border border-border/80 bg-muted/10 px-4 py-3 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40"
                placeholder="Add review notes or appointment context..."
              />
            </label>
          </div>

          <button
            type="button"
            onClick={uploadReport}
            disabled={isSubmitting}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-bold text-white shadow-md shadow-primary/15 transition hover:opacity-95"
          >
            <UploadCloud className="h-4 w-4" />
            Upload report
          </button>
        </div>

        <div className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-lg font-black text-foreground">Search and filters</h3>
              <p className="text-xs text-muted-foreground">
                Filter by category, upload date, doctor, or file type.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="relative block sm:col-span-2">
              <span className="sr-only">Search reports</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search title, category, doctor..."
                className="h-12 w-full rounded-2xl border border-border/80 bg-muted/10 pl-10 pr-4 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40"
              />
            </label>

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="h-12 rounded-2xl border border-border/80 bg-muted/10 px-4 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40"
            >
              <option value="all">All categories</option>
              {REPORT_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="h-12 rounded-2xl border border-border/80 bg-muted/10 px-4 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40"
              aria-label="Filter by date"
            />

            <select
              value={doctorFilter}
              onChange={(event) => setDoctorFilter(event.target.value)}
              className="h-12 rounded-2xl border border-border/80 bg-muted/10 px-4 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40"
            >
              <option value="all">All doctors</option>
              {doctorOptions.map((doctor) => (
                <option key={doctor} value={doctor}>
                  {doctor}
                </option>
              ))}
            </select>

            <select
              value={fileTypeFilter}
              onChange={(event) => setFileTypeFilter(event.target.value)}
              className="h-12 rounded-2xl border border-border/80 bg-muted/10 px-4 text-sm outline-none transition focus:border-primary/80 focus:ring-1 focus:ring-primary/40"
            >
              <option value="all">All file types</option>
              {REPORT_FILE_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 rounded-3xl border border-dashed border-border bg-muted/10 p-5">
            <p className="text-sm font-bold text-foreground">{filteredReports.length} reports found</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Search and filters update the report grid immediately.
            </p>
          </div>
        </div>
      </section>

      {(error || isLoading) && (
        <section
          className={cn(
            "rounded-3xl border px-5 py-4 text-sm font-bold",
            error
              ? "border-destructive/20 bg-destructive/10 text-destructive"
              : "border-border/60 bg-card text-muted-foreground"
          )}
        >
          {error || "Loading reports..."}
        </section>
      )}

      <section className="grid gap-4 xl:grid-cols-2">
        {filteredReports.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-6 text-center xl:col-span-2">
            <p className="text-sm font-bold text-foreground">No reports match your filters.</p>
            <p className="mt-1 text-xs text-muted-foreground">Clear filters or upload a new report.</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <article
              key={report._id}
              className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {getReportFileType(report.mimeType) === "PDF" ? (
                      <FileText className="h-5 w-5" />
                    ) : (
                      <FileImage className="h-5 w-5" />
                    )}
                  </span>
                  <div>
                    <h3 className="text-base font-black text-foreground">{report.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {report.category || "Uncategorized"} · {report.doctorName || "Unassigned"}
                    </p>
                  </div>
                </div>
                <span className="w-fit rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-xs font-black capitalize text-sky-600 dark:text-sky-400">
                  uploaded
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
                <span className="rounded-2xl bg-muted/30 p-3">
                  <CalendarDays className="mb-1 h-4 w-4 text-primary" />
                  {formatDate(getReportDate(report))}
                </span>
                <span className="rounded-2xl bg-muted/30 p-3">
                  <FileText className="mb-1 h-4 w-4 text-primary" />
                  {getReportFileType(report.mimeType)}
                </span>
                <span className="rounded-2xl bg-muted/30 p-3">
                  <Download className="mb-1 h-4 w-4 text-primary" />
                  {formatFileSize(report.size ?? 0)}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewReport(report)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Eye className="h-4 w-4" />
                  View
                </button>
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => deleteReport(report._id)}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      <AnimatePresence>
        {previewReport && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4 py-8 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-2xl shadow-foreground/10"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">
                    Report preview
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-foreground">
                    {previewReport.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Uploaded {formatDate(getReportDate(previewReport))} by {previewReport.doctorName || "Unassigned"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewReport(null)}
                  className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Close report preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className="flex min-h-80 items-center justify-center rounded-3xl border border-dashed border-border bg-muted/20">
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-primary" />
                    <p className="mt-3 text-sm font-black text-foreground">Preview unavailable</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {getReportFileType(previewReport.mimeType)} · {formatFileSize(previewReport.size ?? 0)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    ["Category", previewReport.category || "Uncategorized"],
                    ["Original name", previewReport.originalName || "Unknown"],
                    ["File type", getReportFileType(previewReport.mimeType)],
                    ["File size", formatFileSize(previewReport.size ?? 0)],
                    ["Uploaded date", formatDate(getReportDate(previewReport))],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-border/60 bg-muted/20 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-1 text-sm font-bold capitalize text-foreground">{value}</p>
                    </div>
                  ))}

                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                      Notes
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-foreground">
                      {previewReport.notes || "No notes added."}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
