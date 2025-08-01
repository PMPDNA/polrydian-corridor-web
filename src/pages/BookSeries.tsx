import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Video, FileText, BookOpen, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Chapter {
  id: string;
  book_title: string;
  chapter_number: number;
  chapter_title: string;
  chapter_slug: string;
  video_15min_url?: string;
  video_5min_url?: string;
  shorts_url?: string;
  key_concepts: any;
  reading_time_minutes?: number;
  sequence_order: number;
  is_published: boolean;
  publish_date?: string;
  article?: {
    id: string;
    title: string;
    content: string;
    status: string;
  };
}

export default function BookSeries() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalChapters, setTotalChapters] = useState(0);
  const [publishedChapters, setPublishedChapters] = useState(0);

  useEffect(() => {
    fetchChapters();
  }, []);

  const fetchChapters = async () => {
    try {
      const { data, error } = await supabase
        .from('book_chapters')
        .select(`
          *,
          article:articles(id, title, content, status)
        `)
        .eq('is_published', true)
        .order('sequence_order', { ascending: true });

      if (error) throw error;

      setChapters(data || []);
      setTotalChapters(data?.length || 0);
      setPublishedChapters(data?.filter(ch => ch.is_published).length || 0);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">Loading book series...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Book 1: Corridor Economics
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
            A serialized exploration of strategic thinking, economic corridors, and the philosophy of modern geopolitics. 
            Each chapter available in multiple formats: in-depth articles, 15-minute videos, 5-minute summaries, and quick insights.
          </p>
          
          {totalChapters > 0 && (
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Progress</span>
                <span>{publishedChapters} of {totalChapters} chapters</span>
              </div>
              <Progress value={(publishedChapters / totalChapters) * 100} className="h-2" />
            </div>
          )}
        </div>

        {/* Chapters Grid */}
        {chapters.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">
                The first chapters of Book 1 are being prepared. Subscribe to our newsletter to be notified when they're published.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:gap-8">
            {chapters.map((chapter, index) => (
              <Card key={chapter.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2">
                        Chapter {chapter.chapter_number}: {chapter.chapter_title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {Array.isArray(chapter.key_concepts) && chapter.key_concepts.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {chapter.key_concepts.map((concept, idx) => (
                              <Badge key={idx} variant="secondary">
                                {concept}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant="default">
                      Chapter {chapter.chapter_number}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Article Preview */}
                  {chapter.article && (
                    <div className="mb-6">
                      <p className="text-muted-foreground line-clamp-3 mb-4">
                        {chapter.article.content.replace(/<[^>]*>/g, '').substring(0, 300)}...
                      </p>
                    </div>
                  )}

                  {/* Format Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Article */}
                    {chapter.article && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium text-sm">Article</p>
                            <p className="text-xs text-muted-foreground">
                              {chapter.reading_time_minutes || 15} min read
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/articles/${chapter.article.id}`}>
                            Read
                          </Link>
                        </Button>
                      </div>
                    )}

                    {/* 15-minute Video */}
                    {chapter.video_15min_url && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Video className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium text-sm">Deep Dive</p>
                            <p className="text-xs text-muted-foreground">15 min video</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <a href={chapter.video_15min_url} target="_blank" rel="noopener noreferrer">
                            <Play className="h-3 w-3 mr-1" />
                            Watch
                          </a>
                        </Button>
                      </div>
                    )}

                    {/* 5-minute Video */}
                    {chapter.video_5min_url && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium text-sm">Summary</p>
                            <p className="text-xs text-muted-foreground">5 min video</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <a href={chapter.video_5min_url} target="_blank" rel="noopener noreferrer">
                            <Play className="h-3 w-3 mr-1" />
                            Watch
                          </a>
                        </Button>
                      </div>
                    )}

                    {/* Shorts */}
                    {chapter.shorts_url && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Play className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium text-sm">Quick Insight</p>
                            <p className="text-xs text-muted-foreground">60 sec short</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <a href={chapter.shorts_url} target="_blank" rel="noopener noreferrer">
                            <Play className="h-3 w-3 mr-1" />
                            View
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      {index > 0 && (
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`#chapter-${chapters[index - 1].chapter_number}`}>
                            ← Previous Chapter
                          </Link>
                        </Button>
                      )}
                    </div>
                    <div>
                      {index < chapters.length - 1 && (
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`#chapter-${chapters[index + 1].chapter_number}`}>
                            Next Chapter →
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <Card className="mt-12 text-center">
          <CardContent className="py-8">
            <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              New chapters are published regularly. Subscribe to receive notifications about new content, 
              and get access to exclusive insights and strategic frameworks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/contact">Subscribe to Updates</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/services">Book a Strategic Consultation</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}