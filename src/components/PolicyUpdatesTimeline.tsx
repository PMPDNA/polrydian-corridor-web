import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, RefreshCw, Calendar, AlertTriangle, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PolicyUpdate {
  id: string;
  headline: string;
  summary: string;
  url: string;
  source: string;
  tags: string[];
  published_at: string;
  created_at: string;
}

export function PolicyUpdatesTimeline() {
  const [updates, setUpdates] = useState<PolicyUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const fetchUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('policy_updates')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(15);

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error fetching policy updates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch policy updates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFeed = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase.functions.invoke('policy-updates-fetcher');
      
      if (error) throw error;
      
      // Refresh the updates list
      await fetchUpdates();
      
      toast({
        title: "Success",
        description: "Policy updates refreshed successfully"
      });
    } catch (error) {
      console.error('Error updating policy feed:', error);
      toast({
        title: "Error",
        description: "Failed to update policy feed",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      'tariffs': 'bg-red-100 text-red-800 border-red-200',
      'BRICS': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'semiconductors': 'bg-blue-100 text-blue-800 border-blue-200',
      'trade war': 'bg-orange-100 text-orange-800 border-orange-200',
      'sanctions': 'bg-purple-100 text-purple-800 border-purple-200',
      'supply chain': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[tag] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityIcon = (tags: string[]) => {
    const highPriorityTags = ['tariffs', 'trade war', 'sanctions'];
    const hasHighPriority = tags.some(tag => highPriorityTags.includes(tag));
    
    return hasHighPriority ? (
      <AlertTriangle className="h-4 w-4 text-orange-500" />
    ) : (
      <TrendingUp className="h-4 w-4 text-blue-500" />
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Breaking Policy Updates
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
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Breaking Policy Updates
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={updateFeed}
            disabled={updating}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${updating ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Latest trade policy developments and geopolitical updates affecting corridor economics
        </p>
      </CardHeader>
      <CardContent>
        {updates.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No policy updates available</p>
            <Button onClick={updateFeed} disabled={updating}>
              {updating ? 'Fetching...' : 'Fetch Updates'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((update, index) => (
              <div
                key={update.id}
                className="border-l-2 border-accent/30 pl-4 pb-4 last:pb-0"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getPriorityIcon(update.tags)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(update.published_at)}
                        <span>•</span>
                        <span className="font-medium">{update.source}</span>
                      </div>
                    </div>
                    
                    <h4 className="font-semibold text-foreground leading-snug">
                      {update.headline}
                    </h4>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {update.summary}
                    </p>
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1">
                        {update.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Badge 
                            key={tagIndex}
                            variant="outline" 
                            className={`text-xs ${getTagColor(tag)}`}
                          >
                            {tag}
                          </Badge>
                        ))}
                        {update.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{update.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                      
                      <Button size="sm" variant="ghost" asChild>
                        <a 
                          href={update.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Read
                        </a>
                      </Button>
                    </div>
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