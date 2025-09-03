import { Navigation } from "@/components/Navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ArticleArchive } from "@/components/ArticleArchive";
import { EnhancedSEO } from "@/components/EnhancedSEO";

export default function Articles() {
  return (
    <div className="min-h-screen bg-background">
      <EnhancedSEO 
        title="Strategic Insights & Articles | Corridor Economics Analysis"
        description="Browse expert analysis on corridor economics, geopolitical strategy, supply chain optimization, and market intelligence. Strategic insights for complex global challenges."
        keywords={["strategic insights", "corridor economics", "geopolitical analysis", "supply chain", "market intelligence", "strategic consulting"]}
        url={`${typeof window !== 'undefined' ? window.location.origin : 'https://polrydian.com'}/articles`}
        type="website"
      />
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