import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { useUnifiedArticles } from '@/hooks/useUnifiedData';
import { Link } from 'react-router-dom';

export function LatestArticles() {
  const { data: articlesData } = useUnifiedArticles().useArticleArchive({
    page: 1,
    pageSize: 6,
    sort: 'newest'
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const articles = articlesData?.items || [];
  const articlesToShow = 3;

  // Auto-rotate articles every 8 seconds
  useEffect(() => {
    if (articles.length <= articlesToShow) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => 
        prev + articlesToShow >= articles.length ? 0 : prev + articlesToShow
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [articles.length, articlesToShow]);

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev + articlesToShow >= articles.length ? 0 : prev + articlesToShow
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? Math.max(0, articles.length - articlesToShow) : prev - articlesToShow
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getExcerpt = (metaDescription?: string) => {
    if (metaDescription) return metaDescription;
    return 'Read this strategic insight to stay informed on the latest developments.';
  };

  if (!articles.length) {
    return null;
  }

  const visibleArticles = articles.slice(currentIndex, currentIndex + articlesToShow);

  return (
    <div className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Latest Articles
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay informed with our latest articles on corridor economics, geopolitics, and strategic consulting
          </p>
        </div>

        <div className="relative">
          {/* Navigation Buttons */}
          {articles.length > articlesToShow && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-background/90 backdrop-blur-sm"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-background/90 backdrop-blur-sm"
                onClick={nextSlide}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Articles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500 ease-in-out">
            {visibleArticles.map((article) => (
              <Card key={article.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  {article.featured_image && (
                    <div className="aspect-video rounded-lg overflow-hidden mb-4">
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(article.published_at || article.created_at)}</span>
                    {article.reading_time_minutes && (
                      <>
                        <Clock className="h-4 w-4 ml-2" />
                        <span>{article.reading_time_minutes} min read</span>
                      </>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2 text-xl group-hover:text-primary transition-colors">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground line-clamp-3 mb-4">
                    {getExcerpt(article.meta_description)}
                  </p>
                  <div className="flex items-center justify-between">
                    {article.category && (
                      <Badge variant="secondary" className="mb-2">
                        {article.category}
                      </Badge>
                    )}
                    <Link
                      to={`/articles/${article.slug}`}
                      className="text-primary hover:text-primary/80 font-medium text-sm story-link"
                    >
                      Read More
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Dots Indicator */}
          {articles.length > articlesToShow && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: Math.ceil(articles.length / articlesToShow) }).map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    Math.floor(currentIndex / articlesToShow) === index 
                      ? 'bg-primary w-6' 
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  onClick={() => setCurrentIndex(index * articlesToShow)}
                />
              ))}
            </div>
          )}
        </div>

        {/* View All Articles Button */}
        <div className="text-center mt-12">
          <Link to="/articles">
            <Button size="lg" variant="outline" className="hover-scale">
              View All Articles
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}