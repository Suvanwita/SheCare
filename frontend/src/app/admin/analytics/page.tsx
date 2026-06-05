import { BarChart3 } from "lucide-react";
import { AdminPlaceholderPage } from "../shared";

export default function AdminAnalyticsPage() {
  return (
    <AdminPlaceholderPage
      icon={BarChart3}
      title="Analytics"
      description="Operational metrics, content performance, appointment volume, and user trends will live here."
      columns={["Metric", "Current", "Change", "Period", "Details"]}
    />
  );
}
