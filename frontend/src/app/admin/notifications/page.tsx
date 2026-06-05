import { Bell } from "lucide-react";
import { AdminPlaceholderPage } from "../shared";

export default function AdminNotificationsPage() {
  return (
    <AdminPlaceholderPage
      icon={Bell}
      title="Notifications"
      description="System announcements, targeted notifications, and delivery review tools will live here."
      columns={["Title", "Audience", "Type", "Sent", "Actions"]}
    />
  );
}
