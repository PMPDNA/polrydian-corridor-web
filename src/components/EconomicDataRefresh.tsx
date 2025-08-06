import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DataFreshness {
  series_id: string;
  title: string;
  latest_date: string;
  days_since_latest: number;
  expected_lag: number;
  is_fresh: boolean;
}

const EconomicDataRefresh: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const keyIndicators = [
    { id: 'A191RL1A225NBEA', name: 'GDP Growth', expectedLag: 90 },
    { id: 'UNRATE', name: 'Unemployment', expectedLag: 7 },
    { id: 'CPIAUCSL', name: 'Inflation (CPI)', expectedLag: 14 },
    { id: 'FEDFUNDS', name: 'Fed Funds Rate', expectedLag: 1 },
    { id: 'UMCSENT', name: 'Consumer Sentiment', expectedLag: 3 }
  ];

  const refreshSpecificIndicator = async (seriesId: string, indicatorName: string) => {
    try {
      setRefreshStatus(prev => ({ ...prev, [seriesId]: 'refreshing' }));
      
      console.log(`🔄 Manually refreshing ${indicatorName} (${seriesId})`);
      
      const { data, error } = await supabase.functions.invoke('fred-api-integration', {
        body: {
          operation: 'fetch_indicators',
          indicators: [seriesId.toLowerCase().includes('gdp') ? 'gdp' : 
                      seriesId.toLowerCase().includes('unrate') ? 'unemployment' :
                      seriesId.toLowerCase().includes('cpi') ? 'inflation' :
                      seriesId.toLowerCase().includes('fed') ? 'interest_rate' :
                      'consumer_confidence'],
          limit: 50
        }
      });

      if (error) {
        throw error;
      }

      setRefreshStatus(prev => ({ ...prev, [seriesId]: 'success' }));
      
      toast({
        title: "Data Refreshed",
        description: `${indicatorName} data has been updated successfully.`,
      });

      return data;
    } catch (error) {
      console.error(`Error refreshing ${indicatorName}:`, error);
      setRefreshStatus(prev => ({ ...prev, [seriesId]: 'error' }));
      
      toast({
        title: "Refresh Failed",
        description: `Failed to refresh ${indicatorName} data. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const refreshAllIndicators = async () => {
    setIsRefreshing(true);
    setRefreshStatus({});
    
    try {
      console.log('🔄 Refreshing all economic indicators');
      
      const { data, error } = await supabase.functions.invoke('fred-api-integration', {
        body: {
          operation: 'fetch_indicators',
          limit: 100
        }
      });

      if (error) {
        throw error;
      }

      // Mark all as success
      const successStatus: Record<string, string> = {};
      keyIndicators.forEach(indicator => {
        successStatus[indicator.id] = 'success';
      });
      setRefreshStatus(successStatus);

      toast({
        title: "All Data Refreshed",
        description: "All economic indicators have been updated successfully.",
      });

    } catch (error) {
      console.error('Error refreshing all indicators:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh economic data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'refreshing':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'refreshing':
        return 'outline';
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Economic Data Refresh
        </CardTitle>
        <CardDescription>
          Manually refresh economic indicators to get the latest available data from FRED API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={refreshAllIndicators}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh All Indicators
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {keyIndicators.map((indicator) => (
            <div key={indicator.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-sm">{indicator.name}</div>
                <div className="text-xs text-muted-foreground">
                  Expected lag: {indicator.expectedLag} days
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusVariant(refreshStatus[indicator.id] || 'default')}>
                  {getStatusIcon(refreshStatus[indicator.id] || 'default')}
                  <span className="ml-1">
                    {refreshStatus[indicator.id] === 'refreshing' ? 'Updating...' :
                     refreshStatus[indicator.id] === 'success' ? 'Updated' :
                     refreshStatus[indicator.id] === 'error' ? 'Failed' : 'Ready'}
                  </span>
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => refreshSpecificIndicator(indicator.id, indicator.name)}
                  disabled={refreshStatus[indicator.id] === 'refreshing' || isRefreshing}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">
          <p>• GDP data is typically released quarterly with a 3-month lag</p>
          <p>• Monthly indicators like unemployment and CPI have shorter reporting delays</p>
          <p>• Data freshness warnings appear when data exceeds expected lag periods</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EconomicDataRefresh;