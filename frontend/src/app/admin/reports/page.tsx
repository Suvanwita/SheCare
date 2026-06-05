import { FileText } from "lucide-react";
import { AdminPlaceholderPage } from "../shared";

export default function AdminReportsPage() {
  return (
    <AdminPlaceholderPage
      icon={FileText}
      title="Reports"
      description="Uploaded report metadata review, moderation, and storage visibility will live here."
      columns={["Title", "Category", "Owner", "Uploaded", "Actions"]}
    />
  );
}
