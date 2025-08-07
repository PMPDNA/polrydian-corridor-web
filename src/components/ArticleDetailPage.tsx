import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowLeft, ExternalLink } from "lucide-react";
import { useArticles } from "@/hooks/useArticles";
import { sanitizeHtml } from "@/lib/security";
import type { Article } from "@/hooks/useArticles";

export default function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { articles, loading } = useArticles();
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (id && articles.length > 0) {
      const foundArticle = articles.find(a => a.id === id);
      setArticle(foundArticle || null);
    }
  }, [id, articles]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-12 bg-muted rounded w-3/4"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <Breadcrumbs />
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/articles')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Articles
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <Breadcrumbs />
        
        <article className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/articles')}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Articles
            </Button>
            
            <Badge variant="secondary" className="mb-4">
              Strategy
            </Badge>
            
            <h1 className="text-4xl font-bold mb-6 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex items-center gap-6 text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(article.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{article.reading_time_minutes || 5} min read</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          {article.featured_image && (
            <div className="mb-8">
              <img 
                src={article.featured_image} 
                alt={article.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ 
              __html: sanitizeHtml(article.content)
            }}
          />

          {/* Summary/Excerpt */}
          {article.meta_description && (
            <div className="p-6 bg-muted rounded-lg mb-8">
              <h3 className="text-lg font-semibold mb-2">Summary</h3>
              <p className="text-muted-foreground">{article.meta_description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-8 border-t">
            <Button onClick={() => navigate('/articles')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Articles
            </Button>
            <Button variant="outline" asChild>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Share Article
              </a>
            </Button>
          </div>
        </article>
      </div>
    </div>
  );
}