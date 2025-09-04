import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, TrendingDown, Minus, RefreshCw, Clock } from 'lucide-react';

interface FredSeries {
  series_id: string;
  title: string;
  units: string;
  last_updated: string;
  latest_value?: number;
  previous_value?: number;
  change_percent?: number;
}

export function FredDataDisplay() {
  const [series, setSeries] = useState<FredSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCachedData = async () => {
    try {
      setError(null);
      
      // Fetch series with latest values
      const { data: seriesData, error: seriesError } = await supabase
        .from('fred_series')
        .select('*')
        .order('last_updated', { ascending: false });

      if (seriesError) throw seriesError;

      if (!seriesData || seriesData.length === 0) {
        setError('No economic data available. Try refreshing to fetch latest data.');
        return;
      }

      // For each series, get the latest and previous values
      const enrichedSeries = await Promise.all(
        seriesData.map(async (s) => {
          const { data: observations, error: obsError } = await supabase
            .from('fred_observations')
            .select('value, date')
            .eq('series_id', s.series_id)
            .order('date', { ascending: false })
            .limit(2);

          if (obsError || !observations || observations.length === 0) {
            return {
              ...s,
              latest_value: null,
              previous_value: null,
              change_percent: null
            };
          }

          const latest = observations[0];
          const previous = observations[1];
          
          let change_percent = null;
          if (latest && previous && previous.value !== 0) {
            change_percent = ((latest.value - previous.value) / previous.value) * 100;
          }

          return {
            ...s,
            latest_value: latest?.value || null,
            previous_value: previous?.value || null,
            change_percent
          };
        })
      );

      setSeries(enrichedSeries);
    } catch (error: any) {
      console.error('Error fetching FRED data:', error);
      setError('Failed to load economic data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      const { error } = await supabase.functions.invoke('refresh-fred-data');
      if (error) throw error;
      
      // Wait a moment for the data to be updated, then refetch
      setTimeout(() => {
        fetchCachedData();
        setRefreshing(false);
      }, 2000);
    } catch (error: any) {
      console.error('Error refreshing FRED data:', error);
      setError('Failed to refresh data. Please try again.');
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCachedData();
  }, []);

  const formatValue = (value: number | null, units: string) => {
    if (value === null || value === undefined) return 'N/A';
    
    if (units.toLowerCase().includes('percent')) {
      return `${value.toFixed(2)}%`;
    }
    
    if (units.toLowerCase().includes('billion')) {
      return `$${(value / 1000).toFixed(1)}T`;
    }
    
    if (units.toLowerCase().includes('dollar')) {
      return `$${value.toLocaleString()}`;
    }
    
    return value.toLocaleString();
  };

  const getTrendIcon = (change: number | null) => {
    if (change === null || change === undefined || Math.abs(change) < 0.01) {
      return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
    if (change > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    }
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just updated';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Economic Indicators
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Economic Indicators
            <Badge variant="secondary" className="text-xs">
              FRED Data
            </Badge>
          </CardTitle>
          <Button
            onClick={refreshData}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {series.map((s) => (
            <div key={s.series_id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm leading-tight">{s.title}</h4>
                {getTrendIcon(s.change_percent)}
              </div>
              
              <div className="space-y-1">
                <div className="text-2xl font-bold text-foreground">
                  {formatValue(s.latest_value, s.units)}
                </div>
                
                {s.change_percent !== null && (
                  <div className={`text-sm flex items-center gap-1 ${
                    s.change_percent > 0 ? 'text-green-600' : 
                    s.change_percent < 0 ? 'text-red-600' : 'text-muted-foreground'
                  }`}>
                    {s.change_percent > 0 ? '+' : ''}{s.change_percent.toFixed(2)}%
                    <span className="text-muted-foreground">vs prev</span>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatLastUpdated(s.last_updated)}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {series.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-4">No economic data available</p>
            <Button onClick={refreshData} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Fetch Latest Data
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}