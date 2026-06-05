import { Settings2 } from "lucide-react";
import { AdminPlaceholderPage } from "../shared";

export default function AdminToolsPage() {
  return (
    <AdminPlaceholderPage
      icon={Settings2}
      title="Tools"
      description="Bulk imports, article CSV export, recommender retraining, and maintenance actions will live here."
      columns={["Tool", "Purpose", "Last Run", "Status", "Actions"]}
    />
  );
}
