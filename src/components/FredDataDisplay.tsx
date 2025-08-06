import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Data structure for FRED economic indicators
interface FredData {
  id: string;
  title: string;
  series_id: string;
  latest_value: number;
  latest_date: string;
  change_percent?: number;
  description: string;
  units: string;
  frequency: string;
}

interface FredDataDisplayProps {
  seriesIds?: string[];
  showControls?: boolean;
}

export function FredDataDisplay({ seriesIds, showControls = true }: FredDataDisplayProps) {
  const [data, setData] = useState<FredData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFredData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: response, error } = await supabase.functions.invoke('fred-api-integration', {
        body: { 
          operation: seriesIds ? 'fetch_series' : 'fetch_indicators',
          series_ids: seriesIds 
        }
      });

      if (error) throw error;

      if (response?.success && response?.data && Array.isArray(response.data)) {
        console.log('FRED data received:', response.data);
        setData(response.data);
      } else {
        console.log('FRED response format issue:', response);
        setData([]);
        throw new Error(response?.error || 'Failed to fetch data or invalid data format');
      }
    } catch (err: any) {
      console.error('Error fetching FRED data:', err);
      setError(err.message);
      toast({
        title: "Error Loading Economic Data",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFredData();
  }, [seriesIds]);

  const getTrendIcon = (change?: number) => {
    if (!change) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const formatValue = (value: number, units: string) => {
    if (units.toLowerCase().includes('percent') || units.includes('%')) {
      return `${value.toFixed(2)}%`;
    }
    if (units.toLowerCase().includes('billion')) {
      return `$${(value).toFixed(1)}B`;
    }
    if (units.toLowerCase().includes('million')) {
      return `$${(value).toFixed(1)}M`;
    }
    if (units.toLowerCase().includes('index')) {
      return value.toFixed(1);
    }
    return value.toLocaleString();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6 text-center">
          <p className="text-destructive mb-4">Error loading economic data: {error}</p>
          <Button onClick={fetchFredData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showControls && (
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Economic Indicators</h3>
            <p className="text-sm text-muted-foreground">Latest data from Federal Reserve Economic Data (FRED)</p>
          </div>
          <Button onClick={fetchFredData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(data) && data.map((indicator) => (
          <Card key={indicator.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium line-clamp-2">
                  {indicator.title}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {indicator.frequency}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {formatValue(indicator.latest_value, indicator.units)}
                  </span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(indicator.change_percent)}
                    {indicator.change_percent && (
                      <span className={`text-sm ${indicator.change_percent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(indicator.change_percent).toFixed(2)}%
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <p>As of {new Date(indicator.latest_date).toLocaleDateString()}</p>
                  <p className="line-clamp-2 mt-1">{indicator.description}</p>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  asChild
                >
                  <a 
                    href={`https://fred.stlouisfed.org/series/${indicator.series_id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    View on FRED
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {Array.isArray(data) && data.length === 0 && !loading && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No economic data available.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}