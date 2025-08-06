import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FredData {
  id: string;
  title: string;
  series_id: string;
  latest_value: number;
  latest_date: string;
  change_percent: number;
  description: string;
  units: string;
  frequency: string;
}

interface FredDataDisplayProps {
  seriesIds?: string[];
  showControls?: boolean;
}

export function FredDataDisplay({ 
  seriesIds = ['GDP', 'UNRATE', 'CPIAUCNS', 'FEDFUNDS'], 
  showControls = true 
}: FredDataDisplayProps) {
  const [data, setData] = useState<FredData[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchFredData = async () => {
    setLoading(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('fred-api-integration', {
        body: { 
          action: 'fetch_multiple',
          series_ids: seriesIds 
        }
      });

      if (error) throw error;

      if (response?.success) {
        setData(response.data);
      } else {
        throw new Error(response?.error || 'Failed to fetch FRED data');
      }
    } catch (error: any) {
      console.error('Error fetching FRED data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch economic data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFredData();
  }, [seriesIds]);

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const formatValue = (value: number, units: string) => {
    if (units.includes('Percent')) {
      return `${value.toFixed(1)}%`;
    }
    if (units.includes('Billions')) {
      return `$${(value / 1000).toFixed(1)}T`;
    }
    return value.toLocaleString();
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showControls && (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Economic Indicators</h2>
            <p className="text-muted-foreground">Live data from the Federal Reserve Economic Data (FRED)</p>
          </div>
          <Button onClick={fetchFredData} disabled={loading}>
            Refresh Data
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {data.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {item.frequency} • {new Date(item.latest_date).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="ml-2 text-xs">
                  {item.series_id}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {formatValue(item.latest_value, item.units)}
                  </span>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(item.change_percent)}
                    <span className={`text-sm font-medium ${
                      item.change_percent > 0 ? 'text-green-600' : 
                      item.change_percent < 0 ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {item.change_percent > 0 ? '+' : ''}{item.change_percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-xs"
                  asChild
                >
                  <a 
                    href={`https://fred.stlouisfed.org/series/${item.series_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View on FRED
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}