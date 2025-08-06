import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Calendar, RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PolicyUpdate {
  id: string;
  headline: string;
  summary: string;
  url: string;
  source: string;
  published_at: string;
  tags: string[];
  created_at: string;
}

export function PolicyNewsUpdates() {
  const [updates, setUpdates] = useState<PolicyUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const loadUpdates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('policy_updates')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setUpdates(data || []);
    } catch (error: any) {
      console.error('Error loading policy updates:', error);
      toast({
        title: "Error loading updates",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshUpdates = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('policy-updates-news-api');
      
      if (error) throw error;
      
      toast({
        title: "Updates refreshed",
        description: `Processed ${data.processed_count} new policy updates`
      });
      
      // Reload the updates list
      await loadUpdates();
    } catch (error: any) {
      console.error('Error refreshing updates:', error);
      toast({
        title: "Error refreshing updates",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUpdates();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            Latest Policy Updates
          </CardTitle>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={refreshUpdates}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading updates...</p>
          </div>
        ) : updates.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Updates Available</h3>
            <p className="text-muted-foreground mb-4">
              Configure the News API key to fetch real-time policy updates.
            </p>
            <Button variant="outline" onClick={refreshUpdates} disabled={refreshing}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Refresh
            </Button>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {updates.map((update) => (
              <div key={update.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-2 line-clamp-2">
                      {update.headline}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {update.summary}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(update.published_at)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {update.source}
                      </Badge>
                    </div>
                    {update.tags && update.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {update.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <a 
                      href={update.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Read
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
          <h4 className="font-semibold text-accent mb-2">Policy Intelligence</h4>
          <p className="text-sm text-muted-foreground">
            Stay informed on trade policy, economic corridors, and geopolitical developments 
            that impact strategic planning and corridor economics implementation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}