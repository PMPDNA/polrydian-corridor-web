import { useArticleArchive } from "@/hooks/useArticleArchive";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

export const InsightsGrid = () => {
  const { data, isLoading } = useArticleArchive({ page: 1, pageSize: 6, sort: "newest" });
  
  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-lg mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-6 bg-muted rounded mb-2"></div>
                <div className="h-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const articles = data?.items?.slice(1) || []; // Skip the first one as it's featured
  
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Latest Insights
          </h2>
          <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">
            Strategic analysis and geopolitical perspectives from around the world
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {articles.map((article) => (
            <Card key={article.id} className="group overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-none bg-card/80 backdrop-blur-sm">
              <div className="relative h-48 overflow-hidden">
                {article.featured_image ? (
                  <img 
                    src={article.featured_image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-primary/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                
                {article.category && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-primary/90 text-primary-foreground rounded-full text-xs font-medium">
                      {article.category}
                    </span>
                  </div>
                )}
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{format(new Date(article.published_at || article.created_at), 'MMM dd, yyyy')}</span>
                  </div>
                  {article.reading_time_minutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{article.reading_time_minutes} min</span>
                    </div>
                  )}
                </div>
                
                <h3 className="font-serif text-xl font-bold text-foreground mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                  {article.meta_description || 'Strategic analysis and insights on global economic trends.'}
                </p>
                
                {article.keywords && article.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.keywords.slice(0, 3).map((keyword, index) => (
                      <span key={index} className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
                
                <Button 
                  asChild
                  variant="ghost" 
                  size="sm"
                  className="p-0 h-auto text-primary hover:text-primary/80 font-medium"
                >
                  <Link to={`/articles/${article.slug}`} className="flex items-center gap-1">
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Button 
            asChild
            variant="outline"
            size="lg"
            className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Link to="/articles">
              View All Insights
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};