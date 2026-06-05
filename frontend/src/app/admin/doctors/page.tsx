import { Stethoscope } from "lucide-react";
import { AdminPlaceholderPage } from "../shared";

export default function AdminDoctorsPage() {
  return (
    <AdminPlaceholderPage
      icon={Stethoscope}
      title="Doctors"
      description="Doctor create, edit, verification, slots, fees, and profile management will live here."
      columns={["Name", "Specialization", "Location", "Status", "Actions"]}
    />
  );
}
