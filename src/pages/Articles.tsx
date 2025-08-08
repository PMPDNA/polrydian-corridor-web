import { Navigation } from "@/components/Navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, ExternalLink, Plus, Camera, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArticleForm } from "@/components/ArticleForm";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { SEO } from "@/components/SEO";
import { sanitizeHtml } from "@/lib/security";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { Input } from "@/components/ui/input";
import { useArticleArchive } from "@/hooks/useArticleArchive";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink, PaginationEllipsis } from "@/components/ui/pagination";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: "Strategy" | "Geopolitics" | "Philosophy" | "Defense & Aerospace";
  heroImage: string;
  publishDate: string;
  readTime: number;
  linkedinUrl: string;
  featured: boolean;
  slug?: string; // Add slug property
}

const sampleArticles: Article[] = [
  {
    id: "1",
    title: "Corridor Economics: The Strategic Framework for Global Resilience",
    excerpt: "How disciplined mapping of strategic flows transforms geopolitical friction into sustainable pathways.",
    content: "The impediment to action advances action. This Stoic principle guides my approach to what I call corridor economics...",
    category: "Strategy",
    heroImage: "/api/placeholder/1200/600",
    publishDate: "2024-01-15",
    readTime: 8,
    linkedinUrl: "https://linkedin.com/pulse/example",
    featured: true
  },
  {
    id: "2", 
    title: "Central European Industrial Renaissance: Reshaping Global Supply Chains",
    excerpt: "Strategic diversification from China-centric shipping through Baltic-Caribbean corridors.",
    content: "From 2017 onward, following Port Gdańsk's sister-port agreement with PortMiami...",
    category: "Geopolitics",
    heroImage: "/api/placeholder/1200/600",
    publishDate: "2024-01-10",
    readTime: 12,
    linkedinUrl: "https://linkedin.com/pulse/example2",
    featured: true
  },
  {
    id: "3",
    title: "Stoic Leadership in Volatile Markets: Lessons from Marcus Aurelius",
    excerpt: "Applying ancient wisdom to modern strategic decision-making in uncertain times.",
    content: "What stands in the way becomes the way. This fundamental Stoic teaching...",
    category: "Philosophy", 
    heroImage: "/api/placeholder/1200/600",
    publishDate: "2024-01-05",
    readTime: 6,
    linkedinUrl: "https://linkedin.com/pulse/example3",
    featured: false
  }
];

export default function Articles() {
  const { user, isAdmin } = useSupabaseAuth();
  const { toast } = useToast();
  const [currentHero, setCurrentHero] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const sort: "newest" | "oldest" = "newest";

  const { data, isLoading } = useArticleArchive({
    page,
    pageSize,
    category: selectedCategory === "All" ? undefined : selectedCategory,
    search,
    sort,
  });

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const dbArticles = data?.items || [];

  // Convert database articles to the expected format
  const articles: Article[] = dbArticles?.map((dbArticle: any) => ({
    id: dbArticle.id,
    title: dbArticle.title,
    excerpt: dbArticle.meta_description || dbArticle.content.replace(/<[^>]*>/g, '').substring(0, 200) + "...",
    content: dbArticle.content,
    category: dbArticle.category || "Strategy",
    heroImage: dbArticle.featured_image,
    publishDate: dbArticle.published_at ? new Date(dbArticle.published_at).toISOString().split('T')[0] : new Date(dbArticle.created_at).toISOString().split('T')[0],
    readTime: dbArticle.reading_time_minutes || Math.ceil(dbArticle.content.replace(/<[^>]*>/g, '').length / 200),
    linkedinUrl: dbArticle.linkedin_url || "",
    featured: dbArticle.status === 'published',
    slug: dbArticle.slug,
  })) || [];
  
  const total = data?.total || 0;
  const categories = ["All", "Strategy", "Geopolitics", "Philosophy", "Defense & Aerospace"];
  const featuredArticles = articles.filter(article => article.featured);

  const filteredArticles = selectedCategory === "All" 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  // Auto-rotate hero every 5 seconds
  useEffect(() => {
    if (featuredArticles.length > 1) {
      const timer = setInterval(() => {
        setCurrentHero((prev) => (prev + 1) % featuredArticles.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [featuredArticles.length]);

  const nextHero = () => {
    setCurrentHero((prev) => (prev + 1) % featuredArticles.length);
  };

  const prevHero = () => {
    setCurrentHero((prev) => (prev - 1 + featuredArticles.length) % featuredArticles.length);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Strategic Insights & Articles | Corridor Economics" description="Browse published articles on corridor economics, geopolitics, supply chains, and strategy." keywords={["strategic insights","corridor economics","geopolitics","supply chain","market entry","Patrick Misiewicz","Polrydian Group"]} url={`${window.location.origin}/articles`} />
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <Breadcrumbs />
      </div>
      {/* Hero Section with Rotating Articles */}
      {featuredArticles.length > 0 && (
        <section className="relative h-[70vh] overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{ backgroundImage: `url(${featuredArticles[currentHero]?.heroImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60" />
          </div>
          
          <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
            <div className="max-w-3xl text-white">
              <Badge variant="secondary" className="mb-4">
                {featuredArticles[currentHero]?.category}
              </Badge>
              <h1 className="text-5xl font-bold mb-6 leading-tight animate-fade-in">
                {featuredArticles[currentHero]?.title}
              </h1>
              <p className="text-xl mb-8 text-white/90 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                {featuredArticles[currentHero]?.excerpt}
              </p>
              
              <div className="flex items-center gap-6 mb-8 text-white/80">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(featuredArticles[currentHero]?.publishDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{featuredArticles[currentHero]?.readTime} min read</span>
                </div>
              </div>

              <div className="flex gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
                  <Link to={`/articles/${featuredArticles[currentHero]?.slug || featuredArticles[currentHero]?.id}`}>
                    Read Full Article
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-primary"
                  asChild
                >
                  <a 
                    href={featuredArticles[currentHero]?.linkedinUrl || '#'} 
                    target={featuredArticles[currentHero]?.linkedinUrl ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!featuredArticles[currentHero]?.linkedinUrl) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {featuredArticles[currentHero]?.linkedinUrl ? 'View on LinkedIn' : 'LinkedIn URL Not Set'}
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Hero Navigation */}
          {featuredArticles.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20"
                onClick={prevHero}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20"
                onClick={nextHero}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              {/* Hero Indicators */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {featuredArticles.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentHero(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentHero ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Content Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-4">Strategic Insights</h2>
              <p className="text-lg text-muted-foreground">
                Transforming complexity into clarity through disciplined analysis and strategic thinking.
              </p>
            </div>
            
            {/* Newsletter signup for blog */}
            <div className="mt-2 p-6 bg-secondary/20 rounded-lg border border-secondary/40 w-full md:w-[420px]">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Stay Informed
                </h3>
                <p className="text-muted-foreground mb-4">
                  Get our latest strategic insights and corridor economics analysis delivered to your inbox.
                </p>
                <NewsletterSignup variant="compact" />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="w-full md:max-w-sm">
              <Input
                placeholder="Search articles..."
                value={search}
                onChange={(e) => { setPage(1); setSearch(e.target.value); }}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => { setPage(1); setSelectedCategory(category); }}
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {(isLoading ? Array.from({ length: pageSize }) : filteredArticles).map((article: any, index: number) => (
              <Card key={isLoading ? index : article.id} className="group hover:shadow-lg transition-all duration-300 hover-scale">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src={isLoading ? "/placeholder.svg" : article.heroImage} 
                    alt={isLoading ? "Loading" : article.title}
                    loading="lazy"
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {!isLoading && (
                    <>
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary">
                          {article.category}
                        </Badge>
                      </div>
                      {article.featured && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-accent text-accent-foreground">
                            Featured
                          </Badge>
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                <CardHeader>
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                    {isLoading ? "\u00A0" : article.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {isLoading ? "\u00A0" : article.excerpt}
                  </CardDescription>
                </CardHeader>
                
                {!isLoading && (
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(article.publishDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{article.readTime} min</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mb-4">
                       <Button 
                         size="sm" 
                         className="flex-1"
                         asChild
                       >
                         <Link to={`/articles/${article.slug || article.id}`}>
                            Read Full Article
                          </Link>
                       </Button>
                       <Dialog>
                         <DialogTrigger asChild>
                           <Button size="sm" variant="outline" onClick={() => setSelectedArticle(article)}>
                             Quick Preview
                           </Button>
                         </DialogTrigger>
                          <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
                            <div className="space-y-6">
                              <div>
                                <Badge variant="secondary" className="mb-2">
                                  {article.category}
                                </Badge>
                                <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
                                <div className="flex items-center gap-4 text-muted-foreground mb-6">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(article.publishDate).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{article.readTime} min read</span>
                                  </div>
                                </div>
                                {/* Hero Image */}
                                {article.heroImage && (
                                  <div className="mb-6">
                                    <img 
                                      src={article.heroImage} 
                                      alt={article.title}
                                      loading="lazy"
                                      className="w-full h-64 object-cover rounded-lg"
                                    />
                                  </div>
                                )}
                               </div>
                               {/* Main content - no truncation */}
                               <div 
                                 className="prose prose-lg max-w-none whitespace-pre-wrap"
                                 style={{ maxHeight: 'none', overflow: 'visible' }}
                                 dangerouslySetInnerHTML={{ 
                                   __html: sanitizeHtml(article.content)
                                 }}
                               />
                               {article.excerpt && article.excerpt !== article.content.substring(0, 200) + "..." && (
                                 <div className="mt-6 p-4 bg-muted rounded-lg">
                                   <h3 className="text-lg font-semibold mb-2">Summary</h3>
                                   <p className="text-muted-foreground">{article.excerpt}</p>
                                 </div>
                               )}
                            </div>
                          </DialogContent>
                       </Dialog>
                       <Button size="sm" variant="outline" asChild>
                         <a 
                           href={article.linkedinUrl || '#'} 
                           target={article.linkedinUrl ? "_blank" : "_self"}
                           rel="noopener noreferrer"
                           onClick={(e) => {
                             if (!article.linkedinUrl) {
                               e.preventDefault();
                               toast({
                                 title: "LinkedIn URL not available",
                                 description: "This article doesn't have a LinkedIn URL set.",
                                 variant: "default"
                               });
                             }
                           }}
                         >
                           <ExternalLink className="h-4 w-4 mr-2" />
                           View on LinkedIn
                         </a>
                       </Button>
                    </div>
                    
                    {/* Social Share Buttons */}
                    <SocialShareButtons article={article} compact={true} />
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <ArticlePagination total={total} page={page} pageSize={pageSize} onPageChange={setPage} />
        </div>
      </section>
    </div>
  );
}

function ArticlePagination({ total, page, pageSize, onPageChange }: { total: number; page: number; pageSize: number; onPageChange: (p: number) => void; }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return;
    onPageChange(p);
  };

  const pages: (number | 'ellipsis')[] = [];
  pages.push(1);
  if (page > 3) pages.push('ellipsis');
  if (page > 2) pages.push(page - 1);
  if (page !== 1 && page !== totalPages) pages.push(page);
  if (page < totalPages - 1) pages.push(page + 1);
  if (page < totalPages - 2) pages.push('ellipsis');
  if (totalPages > 1) pages.push(totalPages);

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); goTo(page - 1); }} />
        </PaginationItem>
        {pages.map((p, idx) => (
          <PaginationItem key={idx}>
            {p === 'ellipsis' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink href="#" isActive={p === page} onClick={(e) => { e.preventDefault(); goTo(p as number); }}>
                {p}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext href="#" onClick={(e) => { e.preventDefault(); goTo(page + 1); }} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
