"use client";

import React, { useMemo, useState } from "react";
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
import {
  MOCK_REPORTS,
  REPORT_CATEGORIES,
  REPORT_FILE_TYPES,
  type MedicalReport,
  type ReportFileType,
  type ReportStatus,
} from "../../../data/mockReports";
import { cn, formatDate } from "../../../lib/utils";

const statusTone: Record<ReportStatus, string> = {
  reviewed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  pending: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  shared: "border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

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

function todayIsoDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function ReportsDashboardPage() {
  const [reports, setReports] = useState<MedicalReport[]>(MOCK_REPORTS);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(REPORT_CATEGORIES[0]);
  const [doctorName, setDoctorName] = useState("");
  const [notes, setNotes] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewReport, setPreviewReport] = useState<MedicalReport | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [fileTypeFilter, setFileTypeFilter] = useState("all");

  const doctorOptions = useMemo(
    () => Array.from(new Set(reports.map((report) => report.doctorName).filter(Boolean))),
    [reports]
  );

  const filteredReports = useMemo(
    () =>
      reports.filter((report) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !query ||
          report.title.toLowerCase().includes(query) ||
          report.category.toLowerCase().includes(query) ||
          report.doctorName.toLowerCase().includes(query);
        const matchesCategory = categoryFilter === "all" || report.category === categoryFilter;
        const matchesDate = !dateFilter || report.uploadedAt === dateFilter;
        const matchesDoctor = doctorFilter === "all" || report.doctorName === doctorFilter;
        const matchesFileType = fileTypeFilter === "all" || report.fileType === fileTypeFilter;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesDate &&
          matchesDoctor &&
          matchesFileType
        );
      }),
    [categoryFilter, dateFilter, doctorFilter, fileTypeFilter, reports, searchQuery]
  );

  const handleFile = (file: File | undefined) => {
    if (!file) {
      return;
    }

    const fileType = getFileType(file);
    if (!fileType) {
      setFileError("Only PDF, JPG, and PNG files are supported.");
      setSelectedFile(null);
      setUploadProgress(0);
      return;
    }

    setFileError("");
    setSelectedFile(file);
    setUploadProgress(38);
  };

  const clearUpload = () => {
    setSelectedFile(null);
    setFileError("");
    setUploadProgress(0);
  };

  const uploadReport = () => {
    if (!selectedFile) {
      setFileError("Choose a PDF, JPG, or PNG report before uploading.");
      return;
    }

    const fileType = getFileType(selectedFile);
    if (!fileType) {
      setFileError("Only PDF, JPG, and PNG files are supported.");
      return;
    }

    const reportTitle = title.trim() || selectedFile.name.replace(/\.[^/.]+$/, "");
    const doctor = doctorName.trim() || "Unassigned";

    setUploadProgress(100);
    setReports((currentReports) => [
      {
        id: `report-local-${currentReports.length + 1}-${selectedFile.name}`,
        title: reportTitle,
        category,
        uploadedAt: todayIsoDate(),
        fileType,
        fileSize: formatFileSize(selectedFile.size),
        doctorName: doctor,
        status: "pending",
        notes: notes.trim() || undefined,
      },
      ...currentReports,
    ]);

    setTitle("");
    setCategory(REPORT_CATEGORIES[0]);
    setDoctorName("");
    setNotes("");
    setSelectedFile(null);
    setFileError("");
    setUploadProgress(0);
  };

  const deleteReport = (id: string) => {
    setReports((currentReports) => currentReports.filter((report) => report.id !== id));
    if (previewReport?.id === id) {
      setPreviewReport(null);
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
              Files stay temporary in browser state until backend storage is connected.
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
                  Upload progress placeholder: {uploadProgress}%
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
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-bold text-white shadow-md shadow-primary/15 transition hover:opacity-95"
          >
            <UploadCloud className="h-4 w-4" />
            Add temporary report
          </button>
        </div>

        <div className="glass-card rounded-3xl border border-border/60 p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-lg font-black text-foreground">Search and filters</h3>
              <p className="text-xs text-muted-foreground">
                Filter locally by category, upload date, doctor, or file type.
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
                <option key={item} value={item}>
                  {item}
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

      <section className="grid gap-4 xl:grid-cols-2">
        {filteredReports.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-6 text-center xl:col-span-2">
            <p className="text-sm font-bold text-foreground">No reports match your filters.</p>
            <p className="mt-1 text-xs text-muted-foreground">Clear filters or upload a new report.</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <article
              key={report.id}
              className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {report.fileType === "PDF" ? (
                      <FileText className="h-5 w-5" />
                    ) : (
                      <FileImage className="h-5 w-5" />
                    )}
                  </span>
                  <div>
                    <h3 className="text-base font-black text-foreground">{report.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {report.category} · {report.doctorName}
                    </p>
                  </div>
                </div>
                <span className={cn("w-fit rounded-full border px-2.5 py-1 text-xs font-black capitalize", statusTone[report.status])}>
                  {report.status}
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
                <span className="rounded-2xl bg-muted/30 p-3">
                  <CalendarDays className="mb-1 h-4 w-4 text-primary" />
                  {formatDate(report.uploadedAt)}
                </span>
                <span className="rounded-2xl bg-muted/30 p-3">
                  <FileText className="mb-1 h-4 w-4 text-primary" />
                  {report.fileType}
                </span>
                <span className="rounded-2xl bg-muted/30 p-3">
                  <Download className="mb-1 h-4 w-4 text-primary" />
                  {report.fileSize}
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
                  className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => deleteReport(report.id)}
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
                    Uploaded {formatDate(previewReport.uploadedAt)} by {previewReport.doctorName}
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
                    <p className="mt-3 text-sm font-black text-foreground">Sample preview placeholder</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {previewReport.fileType} · {previewReport.fileSize}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    ["Category", previewReport.category],
                    ["Status", previewReport.status],
                    ["File type", previewReport.fileType],
                    ["File size", previewReport.fileSize],
                    ["Uploaded date", formatDate(previewReport.uploadedAt)],
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
