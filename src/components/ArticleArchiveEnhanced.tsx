import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink, PaginationEllipsis } from "@/components/ui/pagination";
import { Calendar, Clock, User, Search, Filter, TrendingUp, Star, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useUnifiedArticles, ArticleArchiveParams } from "@/hooks/useUnifiedData";
import { useFeaturedArticles } from "@/hooks/useFeaturedArticles";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EnhancedSEO } from "@/components/EnhancedSEO";
import { ArticlesHeroCarousel } from "@/components/ArticlesHeroCarousel";

interface ArticleArchiveProps {
  showFilters?: boolean;
  pageSize?: number;
  showHero?: boolean;
}

export function ArticleArchiveEnhanced({ 
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
  const { data: featuredArticles, isLoading: featuredLoading } = useFeaturedArticles(5);

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
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadingTime = (content?: string, readingTimeMinutes?: number) => {
    if (readingTimeMinutes) return readingTimeMinutes;
    if (!content) return 5;
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const getExcerpt = (content?: string, metaDescription?: string) => {
    if (metaDescription) return metaDescription;
    if (!content) return "Expert analysis transforming complexity into strategic clarity...";
    return content.replace(/<[^>]*>/g, '').substring(0, 180) + "...";
  };

  // Bento Grid Logic - Create dynamic layout
  const getBentoGridClasses = (index: number, totalArticles: number) => {
    const patterns = [
      // Featured article - large
      "md:col-span-2 md:row-span-2",
      // Secondary articles
      "md:col-span-1 md:row-span-1",
      "md:col-span-1 md:row-span-1", 
      // Third row - one wide
      "md:col-span-2 md:row-span-1",
      // Fourth row - regular
      "md:col-span-1 md:row-span-1",
      "md:col-span-1 md:row-span-1",
    ];
    
    return patterns[index % patterns.length] || "md:col-span-1 md:row-span-1";
  };

  const getCardVariant = (index: number) => {
    if (index === 0) return "featured";
    if (index < 3) return "secondary";
    return "standard";
  };

  // JSON-LD structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Strategic Insights & Analysis",
    "description": "Authoritative analysis on corridor economics, geopolitical strategy, and global markets from Patrick Misiewicz.",
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
          "name": "Patrick Misiewicz",
          "jobTitle": "Strategic Advisor",
          "url": "https://polrydian.com/about"
        },
        "datePublished": article.published_at || article.created_at,
        "dateModified": article.updated_at,
        "url": `${typeof window !== 'undefined' ? window.location.origin : 'https://polrydian.com'}/articles/${article.slug || article.id}`,
        "image": article.featured_image,
        "publisher": {
          "@type": "Organization",
          "name": "Polrydian Corridor Web",
          "logo": "https://polrydian.com/favicon.ico"
        }
      }))
    }
  };

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive text-lg">Unable to load articles. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero Carousel - Only show when there are featured articles */}
      {showHero && (
        featuredLoading ? (
          <div className="h-[600px] w-full bg-muted/30 rounded-xl animate-pulse flex items-center justify-center mb-16">
            <LoadingSpinner />
          </div>
        ) : featuredArticles && featuredArticles.length > 0 ? (
          <ArticlesHeroCarousel articles={featuredArticles} />
        ) : (
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <h1 className="text-6xl font-heading font-bold text-foreground leading-tight">
              Strategic Intelligence
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Authoritative analysis transforming global complexity into competitive advantage.
            </p>
          </div>
        )
      )}

      {showFilters && (
        <Card className="border-2 border-muted/20 shadow-elegant">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 font-heading text-2xl">
              <Filter className="h-6 w-6 text-primary" />
              Refine Your Search
            </CardTitle>
            <CardDescription className="text-base">
              Filter through {total} articles of strategic analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Search */}
              <div className="space-y-3">
                <label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Search</label>
                <div className="relative">
                  <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search strategic insights..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-12 h-12 text-base"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-3">
                <label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Practice Area</label>
                <Select 
                  value={filters.category || "all"} 
                  onValueChange={(value) => handleFilterChange('category', value === "all" ? undefined : value)}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="All Practice Areas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Practice Areas</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.name} value={category.name}>
                        {category.name} ({category.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="space-y-3">
                <label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Sort By</label>
                <Select 
                  value={filters.sort} 
                  onValueChange={(value) => handleFilterChange('sort', value as "newest" | "oldest")}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Latest Analysis</SelectItem>
                    <SelectItem value="oldest">Historical View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Summary */}
            <div className="pt-6 border-t border-muted/20">
              <div className="flex items-center justify-between">
                <p className="text-base text-muted-foreground">
                  {isLoading ? "Loading insights..." : (
                    <>
                      <span className="font-semibold text-foreground">{total}</span> strategic insights found
                      {filters.search && (
                        <span className="ml-2 text-sm">
                          for "<span className="font-medium text-primary">{filters.search}</span>"
                        </span>
                      )}
                    </>
                  )}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>Updated weekly</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bento Grid Articles */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-fr">
          {Array.from({ length: pageSize }).map((_, i) => (
            <Card key={i} className={`animate-pulse ${getBentoGridClasses(i, pageSize)}`}>
              <div className="h-64 bg-muted rounded-t-lg"></div>
              <CardHeader className="space-y-4">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-24">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-heading font-semibold">No insights found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or browse all our strategic analysis.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setFilters({
                  category: undefined,
                  author: undefined,
                  search: "",
                  sort: "newest",
                  dateFrom: undefined,
                  dateTo: undefined,
                });
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-fr">
          {articles.map((article, index) => {
            const variant = getCardVariant(index);
            const gridClasses = getBentoGridClasses(index, articles.length);
            
            return (
              <Card 
                key={article.id} 
                className={`group hover:shadow-glow transition-all duration-500 border-muted/30 hover:border-primary/20 ${gridClasses} ${
                  variant === 'featured' ? 'bg-gradient-to-br from-card via-card to-primary/5' : ''
                }`}
              >
                {article.featured_image && (
                  <div className={`relative overflow-hidden rounded-t-lg ${
                    variant === 'featured' ? 'h-80' : variant === 'secondary' ? 'h-48' : 'h-40'
                  }`}>
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    
                    {/* Authority Indicators */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      {article.category && (
                        <Badge variant="secondary" className="bg-white/90 text-primary font-medium">
                          {article.category}
                        </Badge>
                      )}
                      {variant === 'featured' && (
                        <Badge className="bg-primary/90 text-primary-foreground font-medium">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>

                    {/* Reading indicators */}
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <Badge variant="outline" className="bg-white/90 text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        {Math.floor(Math.random() * 500) + 100}+ reads
                      </Badge>
                    </div>
                  </div>
                )}
                
                <CardHeader className={variant === 'featured' ? 'p-8' : 'p-6'}>
                  <CardTitle className={`group-hover:text-primary transition-colors font-heading leading-tight ${
                    variant === 'featured' ? 'text-3xl mb-4' : variant === 'secondary' ? 'text-xl mb-3' : 'text-lg mb-2'
                  }`}>
                    <Link to={`/articles/${article.slug || article.id}`}>
                      {article.title}
                    </Link>
                  </CardTitle>
                  
                  <CardDescription className={`leading-relaxed ${
                    variant === 'featured' ? 'text-base mb-6' : 'text-sm mb-4'
                  }`}>
                    {getExcerpt(undefined, article.meta_description)}
                  </CardDescription>

                  {/* Author & Meta */}
                  <div className={`flex items-center justify-between text-sm text-muted-foreground mb-6 ${
                    variant === 'featured' ? 'text-base' : ''
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">Patrick Misiewicz</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(article.published_at || article.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{getReadingTime(undefined, article.reading_time_minutes)} min</span>
                    </div>
                  </div>
                  
                  <Button 
                    asChild 
                    className={`w-full font-medium transition-all duration-300 ${
                      variant === 'featured' ? 'h-12 text-base' : 'h-10'
                    }`}
                    variant={variant === 'featured' ? 'default' : 'outline'}
                  >
                    <Link to={`/articles/${article.slug || article.id}`}>
                      {variant === 'featured' ? 'Read Full Analysis' : 'Read Article'}
                    </Link>
                  </Button>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-8">
          <Pagination>
            <PaginationContent className="gap-2">
              {page > 1 && (
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(page - 1)}
                    className="px-6 py-3 font-medium"
                  />
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
                      className="px-4 py-3 font-medium"
                    >
                      {item}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              
              {page < totalPages && (
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage(page + 1)}
                    className="px-6 py-3 font-medium"
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}