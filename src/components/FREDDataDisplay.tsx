import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TrendingUp, TrendingDown, BarChart3, Globe, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FREDData {
  id: string;
  title: string;
  series_id: string;
  data_points: any;
  indicator_type: string;
  region: string;
  updated_at: string;
  chart_config: any;
}

interface FREDDataDisplayProps {
  variant?: 'grid' | 'carousel' | 'compact';
  indicatorTypes?: string[];
  className?: string;
}

export const FREDDataDisplay = ({ 
  variant = 'grid', 
  indicatorTypes = ['GDP', 'CPI', 'GSCPI', 'yield_curve'],
  className = '' 
}: FREDDataDisplayProps) => {
  const [fredData, setFredData] = useState<FREDData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('US');
  const { toast } = useToast();

  useEffect(() => {
    fetchFREDData();
  }, [selectedRegion]);

  const fetchFREDData = async () => {
    try {
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('data_source', 'FRED')
        .eq('region', selectedRegion)
        .in('indicator_type', indicatorTypes)
        .eq('is_published', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setFredData((data || []) as FREDData[]);
    } catch (error) {
      console.error('Error fetching FRED data:', error);
      toast({
        title: "Data fetch error",
        description: "Unable to load economic indicators. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getIndicatorIcon = (type: string) => {
    switch (type) {
      case 'GDP': return <TrendingUp className="h-5 w-5" />;
      case 'CPI': return <BarChart3 className="h-5 w-5" />;
      case 'GSCPI': return <Globe className="h-5 w-5" />;
      case 'yield_curve': return <TrendingDown className="h-5 w-5" />;
      default: return <BarChart3 className="h-5 w-5" />;
    }
  };

  const getLatestValue = (dataPoints: any) => {
    if (!dataPoints || !Array.isArray(dataPoints) || dataPoints.length === 0) return 'N/A';
    const latest = dataPoints[dataPoints.length - 1];
    return latest?.value || 'N/A';
  };

  const getTrend = (dataPoints: any) => {
    if (!dataPoints || !Array.isArray(dataPoints) || dataPoints.length < 2) return 'neutral';
    const current = dataPoints[dataPoints.length - 1]?.value;
    const previous = dataPoints[dataPoints.length - 2]?.value;
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'neutral';
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const regions = [
    { code: 'US', label: 'United States' },
    { code: 'EU', label: 'Europe' },
    { code: 'Global', label: 'Global' }
  ];

  if (variant === 'compact') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-accent" />
            Economic Indicators
          </h3>
          <div className="flex gap-1">
            {regions.map((region) => (
              <Button
                key={region.code}
                variant={selectedRegion === region.code ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRegion(region.code)}
              >
                {region.code}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {fredData.slice(0, 4).map((item) => {
            const trend = getTrend(item.data_points);
            return (
              <Card key={item.id} className="p-3">
                <div className="flex items-center justify-between mb-2">
                  {getIndicatorIcon(item.indicator_type)}
                  <Badge variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'}>
                    {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
                  </Badge>
                </div>
                <div className="text-sm font-medium">{item.indicator_type}</div>
                <div className="text-lg font-bold">{getLatestValue(item.data_points)}</div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-accent" />
            Economic Intelligence Dashboard
          </h2>
          <p className="text-muted-foreground">Real-time macroeconomic indicators and corridor analysis</p>
        </div>
        <div className="flex gap-2">
          {regions.map((region) => (
            <Button
              key={region.code}
              variant={selectedRegion === region.code ? "default" : "outline"}
              onClick={() => setSelectedRegion(region.code)}
            >
              {region.label}
            </Button>
          ))}
        </div>
      </div>

      <div className={variant === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' : 'space-y-4'}>
        {fredData.map((item) => {
          const trend = getTrend(item.data_points);
          const latestValue = getLatestValue(item.data_points);
          
          return (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getIndicatorIcon(item.indicator_type)}
                    <CardTitle className="text-lg">{item.indicator_type}</CardTitle>
                  </div>
                  <Badge 
                    variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'}
                  >
                    {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : 
                     trend === 'down' ? <TrendingDown className="h-3 w-3" /> : 
                     <BarChart3 className="h-3 w-3" />}
                  </Badge>
                </div>
                <CardDescription>{item.title}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold">{latestValue}</div>
                  <div className="text-xs text-muted-foreground">
                    Updated: {new Date(item.updated_at).toLocaleDateString()}
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Chart & Analysis
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          {getIndicatorIcon(item.indicator_type)}
                          {item.title}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Current Value</div>
                            <div className="text-2xl font-bold">{latestValue}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Trend</div>
                            <div className="flex items-center gap-2">
                              {trend === 'up' ? <TrendingUp className="h-4 w-4 text-green-500" /> : 
                               trend === 'down' ? <TrendingDown className="h-4 w-4 text-red-500" /> : 
                               <BarChart3 className="h-4 w-4 text-gray-500" />}
                              <span className="capitalize">{trend}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Simple data visualization */}
                        {item.data_points && item.data_points.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold">Recent Data Points</h4>
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                              {item.data_points.slice(-10).reverse().map((point, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>{point.date}</span>
                                  <span className="font-mono">{point.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <Button variant="outline" className="w-full" asChild>
                          <a 
                            href={`https://fred.stlouisfed.org/series/${item.series_id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View on FRED
                          </a>
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};