import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink, PaginationEllipsis } from "@/components/ui/pagination";
import { Calendar, Clock, User, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { useUnifiedArticles, ArticleArchiveParams } from "@/hooks/useUnifiedData";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EnhancedSEO } from "@/components/EnhancedSEO";

interface ArticleArchiveProps {
  showFilters?: boolean;
  pageSize?: number;
  showHero?: boolean;
}

export function ArticleArchive({ 
  showFilters = true, 
  pageSize = 12,
  showHero = false 
}: ArticleArchiveProps) {
  const [filters, setFilters] = useState<Omit<ArticleArchiveParams, 'page' | 'pageSize'>>({
    category: undefined,
    author: undefined,
    search: "",
    sort: "newest",
    dateFrom: undefined,
    dateTo: undefined,
  });
  const [page, setPage] = useState(1);

  const { useArticleArchive, useCategories } = useUnifiedArticles();
  
  const archiveParams: ArticleArchiveParams = {
    page,
    pageSize,
    ...filters,
  };

  const { data: archiveData, isLoading, error } = useArticleArchive(archiveParams);
  const { data: categories } = useCategories();

  const articles = archiveData?.items || [];
  const totalPages = archiveData?.totalPages || 0;
  const total = archiveData?.total || 0;

  // Generate pagination items
  const paginationItems = useMemo(() => {
    const items = [];
    const showEllipsis = totalPages > 7;
    
    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      // Always show first page
      items.push(1);
      
      if (page <= 4) {
        items.push(2, 3, 4, 5, "ellipsis", totalPages);
      } else if (page >= totalPages - 3) {
        items.push("ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        items.push("ellipsis", page - 1, page, page + 1, "ellipsis", totalPages);
      }
    }
    
    return items;
  }, [page, totalPages]);

  const handleFilterChange = (key: keyof typeof filters, value: string | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filtering
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getReadingTime = (content?: string, readingTimeMinutes?: number) => {
    if (readingTimeMinutes) return readingTimeMinutes;
    if (!content) return 5; // Default fallback if no content or reading time
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const getExcerpt = (content?: string, metaDescription?: string) => {
    if (metaDescription) return metaDescription;
    if (!content) return "Read the full article to learn more..."; // Fallback when no content
    return content.replace(/<[^>]*>/g, '').substring(0, 200) + "...";
  };

  // JSON-LD structured data for article list
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Strategic Insights & Articles",
    "description": "Browse published articles on corridor economics, geopolitics, supply chains, and strategy.",
    "url": `${typeof window !== 'undefined' ? window.location.origin : 'https://polrydian.com'}/articles`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": total,
      "itemListElement": articles.map((article, index) => ({
        "@type": "Article",
        "position": index + 1,
        "headline": article.title,
        "description": getExcerpt(undefined, article.meta_description),
        "author": {
          "@type": "Person",
          "name": "Patrick Misiewicz"
        },
        "datePublished": article.published_at || article.created_at,
        "dateModified": article.updated_at,
        "url": `${typeof window !== 'undefined' ? window.location.origin : 'https://polrydian.com'}/articles/${article.slug || article.id}`,
        "image": article.featured_image,
        "publisher": {
          "@type": "Organization",
          "name": "Polrydian Corridor Web"
        }
      }))
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error loading articles. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {showHero && (
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Strategic Insights</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transforming complexity into clarity through disciplined analysis and strategic thinking.
          </p>
        </div>
      )}

      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search articles..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select 
                  value={filters.category || "all"} 
                  onValueChange={(value) => handleFilterChange('category', value === "all" ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.name} value={category.name}>
                        {category.name} ({category.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select 
                  value={filters.sort} 
                  onValueChange={(value) => handleFilterChange('sort', value as "newest" | "oldest")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date From</label>
                <Input
                  type="date"
                  value={filters.dateFrom || ""}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date To</label>
                <Input
                  type="date"
                  value={filters.dateTo || ""}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
                />
              </div>

              {/* Author */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Author (User ID)</label>
                <Input
                  placeholder="Filter by author ID"
                  value={filters.author || ""}
                  onChange={(e) => handleFilterChange('author', e.target.value || undefined)}
                />
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading..." : `${total} article${total !== 1 ? 's' : ''} found`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Articles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: pageSize }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg"></div>
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No articles found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Card key={article.id} className="group hover:shadow-lg transition-all duration-300">
              {article.featured_image && (
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={article.featured_image}
                    alt={article.title}
                    loading="lazy"
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {article.category && (
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary">{article.category}</Badge>
                    </div>
                  )}
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                  <Link to={`/articles/${article.slug || article.id}`}>
                    {article.title}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {getExcerpt(undefined, article.meta_description)}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(article.published_at || article.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{getReadingTime(undefined, article.reading_time_minutes)} min</span>
                  </div>
                </div>
                
                <Button asChild className="w-full">
                  <Link to={`/articles/${article.slug || article.id}`}>
                    Read Article
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              {page > 1 && (
                <PaginationItem>
                  <PaginationPrevious onClick={() => setPage(page - 1)} />
                </PaginationItem>
              )}
              
              {paginationItems.map((item, index) => (
                <PaginationItem key={index}>
                  {item === "ellipsis" ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => setPage(item as number)}
                      isActive={page === item}
                    >
                      {item}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              
              {page < totalPages && (
                <PaginationItem>
                  <PaginationNext onClick={() => setPage(page + 1)} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}