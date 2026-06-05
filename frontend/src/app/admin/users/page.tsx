import { Users } from "lucide-react";
import { AdminPlaceholderPage } from "../shared";

export default function AdminUsersPage() {
  return (
    <AdminPlaceholderPage
      icon={Users}
      title="Users"
      description="User lookup, role changes, activation status, and access review tools will live here."
      columns={["Name", "Email", "Role", "Status", "Actions"]}
    />
  );
}
