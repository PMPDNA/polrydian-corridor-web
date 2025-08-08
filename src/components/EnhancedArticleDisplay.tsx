import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, BookOpen } from "lucide-react";
import { sanitizeHtml } from "@/lib/security";

interface Article {
  id: string;
  title: string;
  content: string;
  meta_description?: string;
  category?: string;
  created_at: string;
  reading_time_minutes?: number;
  featured_image?: string;
  keywords?: string[];
}

interface EnhancedArticleDisplayProps {
  article: Article;
  showFullContent?: boolean;
  showPreview?: boolean;
}

export function EnhancedArticleDisplay({ 
  article, 
  showFullContent = false, 
  showPreview = true 
}: EnhancedArticleDisplayProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadingTime = () => {
    return article.reading_time_minutes || Math.ceil(article.content.length / 200);
  };

  const getPreviewText = () => {
    if (article.meta_description) {
      return article.meta_description;
    }
    // Extract plain text from HTML content for preview
    const plainText = article.content.replace(/<[^>]*>/g, '');
    return plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
  };

  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg">
      {article.featured_image && (
        <div className="relative">
          <img 
            src={article.featured_image}
            alt={article.title}
            className="w-full h-48 object-cover rounded-t-lg"
            loading="lazy"
          />
          {article.category && (
            <Badge 
              variant="secondary" 
              className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm"
            >
              {article.category}
            </Badge>
          )}
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div>
            <h3 className="text-xl font-bold text-foreground leading-tight line-clamp-2 mb-2">
              {article.title}
            </h3>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(article.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{getReadingTime()} min read</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>Article</span>
              </div>
            </div>
          </div>

          {/* Preview/Summary */}
          {showPreview && (
            <div className="space-y-3">
              <p className="text-muted-foreground leading-relaxed">
                {getPreviewText()}
              </p>
            </div>
          )}

          {/* Full Content */}
          {showFullContent && (
            <div 
              className="prose prose-lg max-w-none prose-gray dark:prose-invert
                       prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed
                       prose-a:text-primary prose-strong:text-foreground
                       prose-blockquote:text-muted-foreground prose-blockquote:border-accent
                       prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                       prose-pre:bg-muted prose-pre:border"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
            />
          )}

          {/* Keywords */}
          {article.keywords && article.keywords.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                {article.keywords.slice(0, 3).map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
                {article.keywords.length > 3 && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    +{article.keywords.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}