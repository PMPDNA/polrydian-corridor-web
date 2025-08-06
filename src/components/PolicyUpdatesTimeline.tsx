import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Clock, RefreshCw, Newspaper } from "lucide-react";

interface PolicyUpdate {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  published_at: string;
  tags: string[];
}

export function PolicyUpdatesTimeline() {
  const [updates, setUpdates] = useState<PolicyUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('policy_updates')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error fetching policy updates:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshUpdates = async () => {
    setRefreshing(true);
    try {
      // Call edge function to fetch latest updates
      const { error } = await supabase.functions.invoke('policy-updates-fetcher');
      if (error) throw error;
      
      // Refresh the local data
      await fetchUpdates();
    } catch (error) {
      console.error('Error refreshing policy updates:', error);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getTagColor = (tag: string): string => {
    const colors: { [key: string]: string } = {
      'trade policy': 'bg-blue-100 text-blue-800 border-blue-200',
      'tariffs': 'bg-red-100 text-red-800 border-red-200',
      'corridor': 'bg-green-100 text-green-800 border-green-200',
      'semiconductor': 'bg-purple-100 text-purple-800 border-purple-200',
      'BRICS': 'bg-orange-100 text-orange-800 border-orange-200',
      'supply chain': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[tag] || 'bg-gray-100 text-gray-800 border-gray-200';
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
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            Policy Updates
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshUpdates}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Breaking developments in trade policy and corridor economics
        </p>
      </CardHeader>
      <CardContent>
        {updates.length === 0 ? (
          <div className="text-center py-8">
            <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No policy updates available yet.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshUpdates}
              disabled={refreshing}
            >
              Load Updates
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((update, index) => (
              <div 
                key={update.id} 
                className={`relative border rounded-lg p-4 hover:shadow-md transition-shadow ${
                  index === 0 ? 'border-accent/50 bg-accent/5' : ''
                }`}
              >
                {/* Timeline indicator */}
                <div className="absolute left-0 top-6 w-1 h-8 bg-accent/30 rounded-full"></div>
                
                <div className="ml-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h4 className="font-semibold text-foreground line-clamp-2 flex-1">
                      {update.headline}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(update.published_at)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {update.summary}
                  </p>
                  
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {update.source}
                      </Badge>
                      <div className="flex flex-wrap gap-1">
                        {update.tags.slice(0, 2).map((tag) => (
                          <span 
                            key={tag}
                            className={`text-xs px-2 py-1 rounded-full border ${getTagColor(tag)}`}
                          >
                            {tag}
                          </span>
                        ))}
                        {update.tags.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{update.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Button size="sm" variant="ghost" asChild>
                      <a 
                        href={update.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span className="text-xs">Read</span>
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}