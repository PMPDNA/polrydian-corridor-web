import { Navigation } from "@/components/Navigation";
import { AdvancedSearchComponent } from "@/components/AdvancedSearchComponent";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Users, FileText } from "lucide-react";

const SearchPage = () => {
  const popularSearches = [
    'strategic consultation',
    'corridor economics', 
    'infrastructure advisory',
    'geopolitical strategy',
    'schedule meeting',
    'contact information'
  ];

  const searchCategories = [
    {
      icon: FileText,
      title: 'Services',
      description: 'Strategic consulting and advisory services',
      count: 6
    },
    {
      icon: Users,
      title: 'About',
      description: 'Learn about Patrick and Polrydian Group',
      count: 3
    },
    {
      icon: TrendingUp,
      title: 'Insights',
      description: 'Strategic insights and thought leadership',
      count: 8
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <Breadcrumbs />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-4">Search</h1>
          <p className="text-muted-foreground">
            Find information about our services, insights, and strategic expertise
          </p>
        </div>

        <div className="space-y-8">
          <AdvancedSearchComponent />

          <div className="grid gap-8 md:grid-cols-2">
            {/* Popular Searches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Popular Searches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search) => (
                    <button
                      key={search}
                      onClick={() => {
                        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                        if (searchInput) {
                          searchInput.value = search;
                          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                      }}
                      className="px-3 py-1 bg-muted hover:bg-muted/80 rounded-full text-sm transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Search Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Browse Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {searchCategories.map((category) => (
                    <div key={category.title} className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <category.icon className="h-4 w-4 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{category.title}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                      <Badge variant="secondary">{category.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchPage;