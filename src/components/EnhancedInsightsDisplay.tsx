import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Download, 
  ExternalLink, 
  TrendingUp, 
  AlertCircle,
  RefreshCw,
  Database
} from 'lucide-react';

interface Insight {
  id: string;
  title: string;
  content: string;
  data_source: string;
  series_id: string;
  indicator_type: string;
  region: string;
  data_points: any; // Use any for JSON field to handle various formats
  chart_config: any;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export function EnhancedInsightsDisplay() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { toast } = useToast();

  const loadInsights = async () => {
    try {
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('is_published', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setInsights(data || []);
      setLastUpdated(new Date().toISOString());
    } catch (error: any) {
      console.error('Error loading insights:', error);
      toast({
        title: "Error Loading Insights",
        description: error.message || "Failed to load economic insights.",
        variant: "destructive"
      });
    }
  };

  const updateAllData = async () => {
    setLoading(true);
    try {
      // Call multiple economic data functions
      const promises = [
        supabase.functions.invoke('fred-api-integration', {
          body: { operation: 'fetch_indicators' }
        }),
        supabase.functions.invoke('enhanced-data-collection', {
          body: { sources: ['fred', 'gscpi', 'shipping'] }
        })
      ];

      const results = await Promise.allSettled(promises);
      let successCount = 0;
      let errorCount = 0;

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successCount++;
        } else {
          errorCount++;
          console.error(`Data source ${index + 1} failed:`, result.reason);
        }
      });

      if (successCount > 0) {
        toast({
          title: "Data Updated Successfully",
          description: `${successCount} data source(s) updated. ${errorCount > 0 ? `${errorCount} failed.` : ''}`,
        });
        await loadInsights();
      } else {
        throw new Error('All data sources failed to update');
      }
    } catch (error: any) {
      console.error('Error updating data:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update economic data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const formatValue = (value: string, indicatorType: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    
    if (indicatorType === 'inflation' || indicatorType === 'unemployment') {
      return `${numValue.toFixed(1)}%`;
    }
    if (indicatorType === 'interest_rate') {
      return `${numValue.toFixed(2)}%`;
    }
    return numValue.toLocaleString();
  };

  const getIndicatorColor = (indicatorType: string) => {
    const colors = {
      gdp: 'bg-green-500',
      unemployment: 'bg-red-500',
      inflation: 'bg-orange-500',
      interest_rate: 'bg-blue-500',
      consumer_confidence: 'bg-purple-500',
      default: 'bg-gray-500'
    };
    return colors[indicatorType as keyof typeof colors] || colors.default;
  };

  const getSourceUrl = (dataSource: string) => {
    const urls = {
      'FRED': 'https://fred.stlouisfed.org/',
      'Federal Reserve Economic Data': 'https://fred.stlouisfed.org/',
      'Eurostat': 'https://ec.europa.eu/eurostat',
      'World Bank': 'https://data.worldbank.org/',
      'UN Comtrade': 'https://comtrade.un.org/',
      'Global Supply Chain Pressure Index': 'https://www.newyorkfed.org/research/policy/gscpi'
    };
    return urls[dataSource] || '#';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Economic Data & Insights
          </h2>
          <p className="text-muted-foreground">
            Real-time economic indicators from FRED, World Bank, and other authoritative sources
          </p>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground mt-1">
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
        <Button 
          onClick={updateAllData} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Update All Data
        </Button>
      </div>

      {/* Key Metrics Grid */}
      {insights.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insights.map((insight) => (
            <Card key={insight.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getIndicatorColor(insight.indicator_type)}`} />
                      {insight.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {insight.indicator_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {insight.region}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Latest Value */}
                  {insight.data_points && Array.isArray(insight.data_points) && insight.data_points.length > 0 && (
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {formatValue(
                          insight.data_points[insight.data_points.length - 1]?.value || '0',
                          insight.indicator_type
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(insight.data_points[insight.data_points.length - 1]?.date || insight.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {/* Trend Analysis */}
                  {insight.data_points && Array.isArray(insight.data_points) && insight.data_points.length >= 2 && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {(() => {
                          const latest = parseFloat(insight.data_points[insight.data_points.length - 1]?.value || '0');
                          const previous = parseFloat(insight.data_points[insight.data_points.length - 2]?.value || '0');
                          const change = latest - previous;
                          const direction = change > 0 ? "↗" : change < 0 ? "↘" : "→";
                          const changeText = change > 0 ? "Rising" : change < 0 ? "Declining" : "Stable";
                          return `${direction} ${changeText} (${change > 0 ? '+' : ''}${change.toFixed(2)})`;
                        })()}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {insight.content}
                  </p>

                  {/* Source Information */}
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="h-3 w-3 text-muted-foreground" />
                        <a
                          href={getSourceUrl(insight.data_source)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          {insight.data_source}
                        </a>
                      </div>
                      <Badge variant="outline" className="text-xs">
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
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Economic Data Available</h3>
            <p className="text-muted-foreground mb-4">
              Economic insights data hasn't been loaded yet. Click "Update All Data" to fetch the latest indicators.
            </p>
            <Button onClick={updateAllData} disabled={loading} className="flex items-center gap-2 mx-auto">
              {loading ? <LoadingSpinner size="sm" /> : <Download className="h-4 w-4" />}
              Fetch Economic Data
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Data Sources Footer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Economic Data Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'FRED Economic Data', url: 'https://fred.stlouisfed.org/', description: 'Federal Reserve Bank of St. Louis' },
              { name: 'World Bank Open Data', url: 'https://data.worldbank.org/', description: 'Global development indicators' },
              { name: 'Eurostat', url: 'https://ec.europa.eu/eurostat', description: 'European Union statistics office' },
              { name: 'UN Comtrade', url: 'https://comtrade.un.org/', description: 'International trade statistics' },
              { name: 'NY Fed GSCPI', url: 'https://www.newyorkfed.org/research/policy/gscpi', description: 'Global Supply Chain Pressure Index' },
              { name: 'Container Shipping', url: '#', description: 'Freight rate indicators' }
            ].map((source, index) => (
              <a
                key={index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors block"
              >
                <div className="flex items-start gap-2">
                  <ExternalLink className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">{source.name}</div>
                    <div className="text-xs text-muted-foreground">{source.description}</div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}