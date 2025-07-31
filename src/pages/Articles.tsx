import { Navigation } from "@/components/Navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, ExternalLink, Plus, Camera, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArticleForm } from "@/components/ArticleForm";
import { PhotoGallery } from "@/components/PhotoGallery";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useArticles } from "@/hooks/useArticles";
import { sanitizeHtml } from "@/lib/security";

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
  vipPhotos?: string[];
  eventPhotos?: string[];
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
    featured: true,
    vipPhotos: ["/api/placeholder/300/200", "/api/placeholder/300/200"],
    eventPhotos: ["/api/placeholder/300/200", "/api/placeholder/300/200"]
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
    featured: true,
    eventPhotos: ["/api/placeholder/300/200"]
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
  // Use real articles from database instead of sample data
  const { articles: dbArticles, loading } = useArticles();
  const [currentHero, setCurrentHero] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showForm, setShowForm] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Convert database articles to the expected format
  const articles: Article[] = dbArticles?.map(dbArticle => ({
    id: dbArticle.id,
    title: dbArticle.title,
    excerpt: dbArticle.content.substring(0, 200) + "...",
    content: dbArticle.content,
    category: "Strategy" as const, // Default category
    heroImage: "/placeholder.svg", // Default image
    publishDate: new Date(dbArticle.created_at).toISOString().split('T')[0],
    readTime: Math.ceil(dbArticle.content.length / 200), // Estimate read time
    linkedinUrl: "",
    featured: false,
  })) || sampleArticles; // Fallback to sample articles if no database articles

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
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  Read Full Article
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-primary"
                  asChild
                >
                  <a href={featuredArticles[currentHero]?.linkedinUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on LinkedIn
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
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-4">Strategic Insights</h2>
              <p className="text-lg text-muted-foreground">
                Transforming complexity into clarity through disciplined analysis and strategic thinking.
              </p>
            </div>
            
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Article
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <ArticleForm 
                  onSave={(article) => {
                    // Article will be saved to database via ArticleForm
                    setShowForm(false);
                  }}
                  onCancel={() => setShowForm(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Articles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredArticles.map((article, index) => (
              <Card key={article.id} className="group hover:shadow-lg transition-all duration-300 hover-scale">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img 
                    src={article.heroImage} 
                    alt={article.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
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
                </div>
                
                <CardHeader>
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {article.excerpt}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(article.publishDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{article.readTime} min</span>
                    </div>
                  </div>
                  
                   <div className="flex gap-2">
                     <Dialog>
                       <DialogTrigger asChild>
                         <Button size="sm" className="flex-1" onClick={() => setSelectedArticle(article)}>
                           Read More
                         </Button>
                       </DialogTrigger>
                       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                         <div className="space-y-6">
                           <div>
                             <Badge variant="secondary" className="mb-2">
                               {article.category}
                             </Badge>
                             <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
                             <div className="flex items-center gap-4 text-muted-foreground mb-6">
                               <div className="flex items-center gap-2">
                                 <Calendar className="h-4 w-4" />
                                 <span>{formatDate(article.publishDate)}</span>
                               </div>
                               <div className="flex items-center gap-2">
                                 <Clock className="h-4 w-4" />
                                 <span>{article.readTime} min read</span>
                               </div>
                             </div>
                           </div>
                           <div 
                             className="prose prose-lg max-w-none"
                             dangerouslySetInnerHTML={{ 
                               __html: sanitizeHtml(article.content)
                             }}
                           />
                         </div>
                       </DialogContent>
                     </Dialog>
                    <Button size="sm" variant="outline" asChild>
                      <a href={article.linkedinUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>

                  {/* Photo Gallery Preview */}
                  {(article.vipPhotos || article.eventPhotos) && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Camera className="h-4 w-4" />
                        <span>Event Gallery</span>
                      </div>
                      <PhotoGallery 
                        vipPhotos={article.vipPhotos} 
                        eventPhotos={article.eventPhotos}
                        compact={true}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* VIP & Events Gallery Section */}
          <PhotoGallery />
        </div>
      </section>
    </div>
  );
}