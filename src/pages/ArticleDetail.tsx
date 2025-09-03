import { useParams, useNavigate, Link } from "react-router-dom";

import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import { useUnifiedArticles } from "@/hooks/useUnifiedData";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import Footer from "@/components/Footer";
import { sanitizeHtml } from "@/lib/security";
import { EnhancedSEO } from "@/components/EnhancedSEO";

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { useArticleBySlug } = useUnifiedArticles();
  const { data: article, isLoading: loading } = useArticleBySlug(slug!);


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
        <EnhancedSEO title="Article Not Found" description="The requested article could not be found." />
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="text-center py-16">
            <h1 className="text-4xl font-bold text-foreground mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The article you're looking for doesn't exist or has been moved.
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

  const articleUrl = `${window.location.origin}/articles/${article.slug || article.id}`;

  return (
    <div className="min-h-screen bg-background">
      <EnhancedSEO 
        title={article.title}
        description={article.meta_description || article.content.substring(0, 160)}
        keywords={article.keywords}
        image={article.featured_image}
        url={articleUrl}
        type="article"
        publishedTime={article.published_at || article.created_at}
        modifiedTime={article.updated_at}
        section={article.category}
        tags={article.keywords}
      />
      <Navigation />
      
      {/* Article Header */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" asChild className="mb-6">
              <Link to="/articles">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Articles
              </Link>
            </Button>
            
            <div className="mb-6">
              <Badge variant="secondary" className="mb-4">
                {article.keywords?.[0] || 'Strategy'}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                {article.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(article.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{article.reading_time_minutes || Math.ceil(article.content.length / 200)} min read</span>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            {article.featured_image && (
              <div className="mb-8">
                <img 
                  src={article.featured_image} 
                  alt={article.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-[400px] object-cover rounded-lg shadow-elegant"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
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

                <div 
                  className="prose prose-lg max-w-none prose-gray dark:prose-invert
                           prose-headings:text-foreground prose-p:text-muted-foreground
                           prose-a:text-primary prose-strong:text-foreground
                           prose-blockquote:text-muted-foreground prose-blockquote:border-accent"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
                />

                {/* LinkedIn URL Link */}
                {article.linkedin_url && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200">Discuss on LinkedIn</h4>
                        <p className="text-sm text-blue-600 dark:text-blue-300">Join the conversation on this topic</p>
                      </div>
                    </div>
                    <a 
                      href={article.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    >
                      View LinkedIn Post →
                    </a>
                  </div>
                )}

                {/* Social Sharing */}
                <div className="mt-12 pt-8 border-t">
                  <div className="flex items-center gap-4 mb-4">
                    <Share2 className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Share this article</span>
                  </div>
                  <SocialShareButtons 
                    article={{
                      id: article.id,
                      slug: article.slug,
                      title: article.title,
                      excerpt: article.meta_description || article.content.substring(0, 200) + "...",
                      heroImage: article.featured_image
                    }} 
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  {/* Newsletter Signup */}
                  <NewsletterSignup variant="compact" />
                  
                  {/* Strategic Consultation CTA */}
                  <Card className="shadow-elegant bg-gradient-to-br from-primary/5 to-accent/5 border-accent/20">
                    <CardContent className="p-6 text-center">
                      <h3 className="font-semibold mb-3">Need Strategic Guidance?</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Transform your challenges into strategic opportunities with expert consultation.
                      </p>
                      <Button 
                        size="sm" 
                        className="w-full"
                        asChild
                      >
                        <Link to="/schedule">Schedule Consultation</Link>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Keywords */}
                  {article.keywords && article.keywords.length > 0 && (
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-3">Topics</h3>
                        <div className="flex flex-wrap gap-2">
                          {article.keywords.map((keyword: string, index: number) => (
                            <Badge key={index} variant="outline">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}