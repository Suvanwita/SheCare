export type ReportFileType = "PDF" | "JPG" | "PNG";
export type ReportStatus = "reviewed" | "pending" | "shared";

export interface MedicalReport {
  id: string;
  title: string;
  category: string;
  uploadedAt: string;
  fileType: ReportFileType;
  fileSize: string;
  doctorName: string;
  status: ReportStatus;
  notes?: string;
}

export const REPORT_CATEGORIES = [
  "Lab Report",
  "Ultrasound",
  "Prescription",
  "Hormone Panel",
  "Consultation Note",
  "Other",
];

export const REPORT_FILE_TYPES: ReportFileType[] = ["PDF", "JPG", "PNG"];

export const MOCK_REPORTS: MedicalReport[] = [
  {
    id: "report-1",
    title: "Hormone Panel - May",
    category: "Hormone Panel",
    uploadedAt: "2026-05-21",
    fileType: "PDF",
    fileSize: "1.8 MB",
    doctorName: "Dr. Nisha Iyer",
    status: "reviewed",
    notes: "TSH and insulin markers reviewed. Follow-up suggested in 8 weeks.",
  },
  {
    id: "report-2",
    title: "Pelvic Ultrasound",
    category: "Ultrasound",
    uploadedAt: "2026-05-13",
    fileType: "JPG",
    fileSize: "940 KB",
    doctorName: "Dr. Anjali Rao",
    status: "pending",
    notes: "Uploaded for upcoming appointment review.",
  },
  {
    id: "report-3",
    title: "Supplement Prescription",
    category: "Prescription",
    uploadedAt: "2026-04-28",
    fileType: "PNG",
    fileSize: "720 KB",
    doctorName: "Dr. Priya Menon",
    status: "shared",
    notes: "Shared with nutrition specialist.",
  },
  {
    id: "report-4",
    title: "CBC Lab Report",
    category: "Lab Report",
    uploadedAt: "2026-04-10",
    fileType: "PDF",
    fileSize: "1.2 MB",
    doctorName: "Dr. Meera Shah",
    status: "reviewed",
    notes: "Iron markers normal.",
  },
];
