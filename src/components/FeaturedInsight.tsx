import { useArticleArchive } from "@/hooks/useArticleArchive";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

export const FeaturedInsight = () => {
  const { data, isLoading } = useArticleArchive({ page: 1, pageSize: 1, sort: "newest" });
  
  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4 w-64 mx-auto"></div>
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </section>
    );
  }

  const featuredArticle = data?.items[0];
  
  if (!featuredArticle) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Featured Insight
          </h2>
          <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
            Our latest analysis on global economic corridors and geopolitical trends
          </p>
        </div>

        <Card className="overflow-hidden shadow-2xl border-none bg-card/90 backdrop-blur-sm">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative h-80 md:h-full">
              {featuredArticle.featured_image ? (
                <img 
                  src={featuredArticle.featured_image}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-primary" />
                    </div>
                    <p className="font-serif text-lg">Featured Analysis</p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
            
            {/* Content */}
            <CardContent className="p-8 md:p-12 flex flex-col justify-center">
              <div className="mb-4">
                {featuredArticle.category && (
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-3">
                    {featuredArticle.category}
                  </span>
                )}
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(featuredArticle.published_at || featuredArticle.created_at), 'MMM dd, yyyy')}</span>
                  </div>
                  {featuredArticle.reading_time_minutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{featuredArticle.reading_time_minutes} min read</span>
                    </div>
                  )}
                </div>
              </div>
              
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
                {featuredArticle.title}
              </h3>
              
              <p className="font-sans text-lg text-muted-foreground leading-relaxed mb-6">
                {featuredArticle.meta_description || 'Explore the latest insights on global economic corridors, geopolitical trends, and strategic advisory perspectives.'}
              </p>
              
              <Button 
                asChild
                size="lg"
                className="self-start bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Link to={`/articles/${featuredArticle.slug}`}>
                  Read Full Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </div>
        </Card>
      </div>
    </section>
  );
};