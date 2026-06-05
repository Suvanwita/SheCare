import { Newspaper } from "lucide-react";
import { AdminPlaceholderPage } from "../shared";

export default function AdminArticlesPage() {
  return (
    <AdminPlaceholderPage
      icon={Newspaper}
      title="Articles"
      description="Knowledge Hub authoring, publishing, featuring, and recommendation refresh tools will live here."
      columns={["Title", "Category", "Published", "Featured", "Actions"]}
    />
  );
}
