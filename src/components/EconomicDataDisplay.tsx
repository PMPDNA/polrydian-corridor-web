import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EconomicDataDisplayProps {
  insights?: any[];
  loading?: boolean;
}

export function EconomicDataDisplay({ insights = [], loading = false }: EconomicDataDisplayProps) {
  const { toast } = useToast();

  const fetchEconomicData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('fred-api-integration', {
        body: { 
          operation: 'fetch_indicators',
          indicators: ['gdp', 'unemployment', 'inflation', 'interest_rate', 'consumer_confidence']
        }
      });

      if (error) throw error;

      toast({
        title: "Economic Data Updated",
        description: "Latest economic indicators have been fetched and updated.",
      });

      // Refresh the page or update state as needed
      window.location.reload();
    } catch (error: any) {
      console.error('Error fetching economic data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch economic data.",
        variant: "destructive"
      });
    }
  };

  const formatValue = (value: any) => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    if (typeof value === 'string' && !isNaN(parseFloat(value))) {
      return parseFloat(value).toFixed(2);
    }
    return value;
  };

  const getSourceLinks = () => [
    { name: 'FRED Economic Data', url: 'https://fred.stlouisfed.org/', icon: ExternalLink },
    { name: 'Eurostat', url: 'https://ec.europa.eu/eurostat', icon: ExternalLink },
    { name: 'World Bank Data', url: 'https://data.worldbank.org/', icon: ExternalLink },
    { name: 'UN Comtrade', url: 'https://comtrade.un.org/', icon: ExternalLink },
    { name: 'Global Supply Chain Pressure Index', url: 'https://www.newyorkfed.org/research/policy/gscpi', icon: ExternalLink }
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Economic Data Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time economic indicators and analysis from multiple authoritative sources
          </p>
        </div>
        <Button onClick={fetchEconomicData} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Update Data
        </Button>
      </div>

      {/* Key Economic Indicators */}
      {insights && insights.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insights.map((insight, index) => (
            <Card key={insight.id || index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      {insight.title}
                    </CardTitle>
                    <Badge variant="outline" className="mt-2">
                      {insight.indicator_type || insight.region || 'Economic Data'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Latest Value */}
                  {insight.data_points && insight.data_points.length > 0 && (
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {formatValue(insight.data_points[insight.data_points.length - 1]?.value)}
                        {insight.indicator_type === 'inflation' || insight.indicator_type === 'unemployment' ? '%' : ''}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Latest: {new Date(insight.data_points[insight.data_points.length - 1]?.date || insight.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {/* Trend Indicator */}
                  {insight.data_points && insight.data_points.length >= 2 && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Trend: {
                          parseFloat(insight.data_points[insight.data_points.length - 1]?.value || 0) > 
                          parseFloat(insight.data_points[insight.data_points.length - 2]?.value || 0) 
                            ? "↗ Rising" : "↘ Declining"
                        }
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {insight.content}
                  </p>

                  {/* Data Source */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Source: {insight.data_source}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {insight.series_id}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Economic Data Available</h3>
            <p className="text-muted-foreground mb-4">
              Click "Update Data" to fetch the latest economic indicators from FRED and other sources.
            </p>
            <Button onClick={fetchEconomicData} className="flex items-center gap-2 mx-auto">
              <Download className="h-4 w-4" />
              Fetch Economic Data
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Data Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getSourceLinks().map((source, index) => (
              <a
                key={index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <source.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{source.name}</span>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}