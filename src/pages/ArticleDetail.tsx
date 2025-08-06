import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";
import { useArticles } from "@/hooks/useArticles";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { sanitizeHtml } from "@/lib/security";
import { ConsultationBookingForm } from "@/components/ConsultationBookingForm";

export default function ArticleDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { articles, loading } = useArticles();
  const [article, setArticle] = useState<any>(null);

  useEffect(() => {
    if (articles && slug) {
      // Find article by ID or slug format
      const found = articles.find(a => {
        const titleSlug = a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return a.id === slug || titleSlug === slug;
      });
      setArticle(found);
    }
  }, [articles, slug]);

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
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading article...</p>
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
          <div className="text-center py-16">
            <h1 className="text-4xl font-bold text-foreground mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist or has been moved.</p>
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
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-12">
        {article.featured_image && article.featured_image !== "/placeholder.svg" && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${article.featured_image})` }}
          />
        )}
        <div className="relative container mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/articles')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Button>
          
          <div className="max-w-4xl mx-auto text-center">
            {article.keywords && article.keywords.length > 0 && (
              <Badge variant="secondary" className="mb-4">
                {article.keywords[0]}
              </Badge>
            )}
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              {article.title}
            </h1>
            <div className="flex items-center justify-center gap-6 text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(article.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{article.reading_time_minutes || Math.ceil(article.content.length / 200)} min read</span>
              </div>
            </div>
            
            {/* Featured Image */}
            {article.featured_image && article.featured_image !== "/placeholder.svg" && (
              <div className="mb-8">
                <img 
                  src={article.featured_image} 
                  alt={article.title}
                  className="w-full max-w-4xl mx-auto h-64 md:h-96 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-12">
            {/* Main Article Content */}
            <div className="lg:col-span-3">
              <div className="max-w-none">
                {/* Article Summary */}
                {article.meta_description && (
                  <Card className="mb-8 bg-accent/5 border-accent/20">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-2">Summary</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {article.meta_description}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Main Content */}
                <div 
                  className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-blockquote:text-muted-foreground prose-blockquote:border-accent prose-a:text-accent prose-a:no-underline hover:prose-a:underline"
                  dangerouslySetInnerHTML={{ 
                    __html: sanitizeHtml(article.content)
                  }}
                />

                {/* Social Share */}
                <div className="mt-12 pt-8 border-t border-border">
                  <div className="flex items-center gap-4 mb-4">
                    <Share2 className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium text-foreground">Share this article</span>
                  </div>
                  <SocialShareButtons 
                    article={{
                      title: article.title,
                      excerpt: article.meta_description || article.content.substring(0, 200) + "...",
                      id: article.id
                    }} 
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-8">
                {/* Consultation CTA */}
                <Card className="shadow-elegant bg-gradient-to-br from-primary/5 to-accent/5 border-accent/20">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold text-foreground mb-2">
                      Strategic Consultation
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Transform your challenges into strategic opportunities.
                    </p>
                    <Button size="sm" className="w-full" asChild>
                      <a href="#contact">Schedule Consultation</a>
                    </Button>
                  </CardContent>
                </Card>

                {/* Keywords */}
                {article.keywords && article.keywords.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-foreground mb-4">Topics</h3>
                      <div className="flex flex-wrap gap-2">
                        {article.keywords.map((keyword: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Newsletter Signup */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-2">
                      Strategic Insights
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get weekly analysis on global economic corridors and strategic opportunities.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Subscribe to Newsletter
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to Transform Your Strategic Challenges?
              </h2>
              <p className="text-lg text-muted-foreground">
                Let's discuss how corridor economics can unlock new pathways for your organization.
              </p>
            </div>
            <ConsultationBookingForm />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}