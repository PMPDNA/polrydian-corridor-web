import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Insight {
  id: string;
  title: string;
  series_id: string;
  content: string;
  data_points: any;
  chart_config: any;
  created_at: string;
  indicator_type: string;
}

export default function InsightsDashboard() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data, error } = await supabase
          .from('insights_latest')
          .select('*')
          .limit(6);

        if (error) {
          console.error('Error fetching insights:', error);
          return;
        }

        // Data is already deduplicated by the view
        setInsights(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const formatValue = (insight: Insight) => {
    const latestValue = insight.chart_config?.latest_value;
    if (latestValue === undefined) return 'N/A';
    
    // Format based on indicator type
    if (insight.indicator_type === 'gdp_growth' || insight.series_id === 'UNRATE') {
      return `${latestValue}%`;
    }
    
    if (typeof latestValue === 'number') {
      return latestValue.toLocaleString();
    }
    
    return latestValue.toString();
  };

  const getTrendIcon = (insight: Insight) => {
    const changePercent = insight.chart_config?.change_percent;
    if (changePercent === undefined) return <Minus className="h-4 w-4" />;
    
    if (changePercent > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (changePercent < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getIndicatorDisplayName = (seriesId: string, title: string) => {
    const displayMap: { [key: string]: string } = {
      'A191RL1A225NBEA': 'GDP Growth',
      'UNRATE': 'Unemployment Rate',
      'CPIAUCSL': 'Inflation (CPI)',
      'FEDFUNDS': 'Federal Funds Rate',
      'UMCSENT': 'Consumer Sentiment'
    };
    
    return displayMap[seriesId] || title;
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Economic Insights</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Economic Insights</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay informed with the latest economic indicators and market intelligence
          </p>
        </div>
        
        {insights.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No insights available at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insights.map((insight) => (
              <Card key={insight.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {getIndicatorDisplayName(insight.series_id, insight.title)}
                    </CardTitle>
                    {getTrendIcon(insight)}
                  </div>
                  <Badge variant="outline" className="w-fit">
                    {insight.chart_config?.latest_date || 'Latest'}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {formatValue(insight)}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {insight.content}
                  </p>
                  {insight.chart_config?.change_percent !== undefined && (
                    <div className="mt-3 text-sm">
                      <span className={`font-medium ${
                        insight.chart_config.change_percent > 0 ? 'text-green-600' : 
                        insight.chart_config.change_percent < 0 ? 'text-red-600' : 'text-muted-foreground'
                      }`}>
                        {insight.chart_config.change_percent > 0 ? '+' : ''}
                        {insight.chart_config.change_percent.toFixed(2)}%
                      </span>
                      <span className="text-muted-foreground ml-1">vs previous</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
