import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Insight {
  id: string;
  title: string;
  content?: string;
  indicator_type?: string;
  region?: string;
  created_at: string;
}

export const LatestInsightsTeaser = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestInsights = async () => {
      try {
        const { data, error } = await supabase
          .from('insights')
          .select('id, title, content, indicator_type, region, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setInsights(data || []);
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestInsights();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center justify-center gap-2">
            <TrendingUp className="h-8 w-8 text-accent" />
            Latest Insights
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay informed with our latest economic intelligence and corridor analysis
          </p>
        </div>

        {insights.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {insights.map((insight) => (
              <Card key={insight.id} className="hover:shadow-glow transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    {insight.indicator_type && (
                      <Badge variant="secondary" className="text-xs">
                        {insight.indicator_type}
                      </Badge>
                    )}
                    {insight.region && (
                      <Badge variant="outline" className="text-xs">
                        {insight.region}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{insight.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {insight.content && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {insight.content.length > 120 ? insight.content.substring(0, 120) + '...' : insight.content}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(insight.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">New insights coming soon</p>
          </div>
        )}

        <div className="text-center">
          <Button 
            asChild 
            variant="outline" 
            size="lg"
            onClick={() => {
              // Track insights page navigation
              (window as any).gtag?.('event', 'insights_view_all', {
                event_category: 'navigation',
                event_label: 'homepage_teaser_cta',
                value: 1
              });
            }}
          >
            <Link to="/insights" className="gap-2">
              View All Insights
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};