import { AdminLayout } from "@/layouts/AdminLayout";
import { EnhancedArticleManager } from "@/components/EnhancedArticleManager";

export default function ArticleManager() {
  return (
    <AdminLayout title="Article Management">
      <EnhancedArticleManager />
    </AdminLayout>
  );
}