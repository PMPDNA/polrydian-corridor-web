import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, RefreshCw, Calendar, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CSISArticle {
  id: string;
  title: string;
  summary: string;
  link: string;
  category: string;
  published_at: string;
  created_at: string;
}

export function CSISAnalysisFeed() {
  const [articles, setArticles] = useState<CSISArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('csis_articles')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching CSIS articles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch CSIS articles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFeed = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase.functions.invoke('csis-feed-fetcher');
      
      if (error) throw error;
      
      // Refresh the articles list
      await fetchArticles();
      
      toast({
        title: "Success",
        description: "CSIS feed updated successfully"
      });
    } catch (error) {
      console.error('Error updating CSIS feed:', error);
      toast({
        title: "Error",
        description: "Failed to update CSIS feed",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'economics':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'analysis':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            CSIS Economics Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            CSIS Economics Analysis
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={updateFeed}
            disabled={updating}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${updating ? 'animate-spin' : ''}`} />
            Update Feed
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Latest economics and trade analysis from the Center for Strategic & International Studies
        </p>
      </CardHeader>
      <CardContent>
        {articles.length === 0 ? (
          <div className="text-center py-8">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No CSIS articles available</p>
            <Button onClick={updateFeed} disabled={updating}>
              {updating ? 'Fetching...' : 'Fetch Articles'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <div
                key={article.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getCategoryColor(article.category)}`}
                      >
                        {article.category}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(article.published_at)}
                      </div>
                    </div>
                    
                    <h4 className="font-semibold text-foreground leading-snug line-clamp-2">
                      {article.title}
                    </h4>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article.summary}
                    </p>
                  </div>
                  
                  <Button size="sm" variant="outline" asChild>
                    <a 
                      href={article.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 shrink-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Read
                    </a>
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <Button variant="outline" size="sm" asChild className="w-full">
                <a 
                  href="https://www.csis.org/programs/economics-program" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View All CSIS Economics Research
                </a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}