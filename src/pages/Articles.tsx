import { Navigation } from "@/components/Navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ArticleArchive } from "@/components/ArticleArchive";

export default function Articles() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <Breadcrumbs />
      </div>
      
      <div className="container mx-auto px-4 pb-12">
        <ArticleArchive showFilters={true} pageSize={12} showHero={true} />
      </div>
    </div>
  );
}