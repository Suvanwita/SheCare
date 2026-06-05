import { CalendarCheck } from "lucide-react";
import { AdminPlaceholderPage } from "../shared";

export default function AdminAppointmentsPage() {
  return (
    <AdminPlaceholderPage
      icon={CalendarCheck}
      title="Appointments"
      description="Appointment monitoring, status updates, and doctor schedule oversight will live here."
      columns={["Patient", "Doctor", "Date", "Status", "Actions"]}
    />
  );
}
