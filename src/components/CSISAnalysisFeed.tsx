import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Calendar, RefreshCw } from "lucide-react";

interface CSISArticle {
  id: string;
  title: string;
  summary: string;
  link: string;
  published_at: string;
  category: string;
}

export function CSISAnalysisFeed() {
  const [articles, setArticles] = useState<CSISArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('csis_articles')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching CSIS articles:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshFeed = async () => {
    setRefreshing(true);
    try {
      // Call edge function to fetch latest articles
      const { error } = await supabase.functions.invoke('csis-feed-fetcher');
      if (error) throw error;
      
      // Refresh the local data
      await fetchArticles();
    } catch (error) {
      console.error('Error refreshing CSIS feed:', error);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            Latest CSIS Analysis
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshFeed}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Strategic insights from the Center for Strategic & International Studies
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {articles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No CSIS articles available yet.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshFeed}
              className="mt-2"
              disabled={refreshing}
            >
              Load Articles
            </Button>
          </div>
        ) : (
          articles.map((article) => (
            <div key={article.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-2 line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {article.summary}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(article.published_at)}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {article.category}
                    </Badge>
                  </div>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <a 
                    href={article.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 shrink-0"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Read More
                  </a>
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}