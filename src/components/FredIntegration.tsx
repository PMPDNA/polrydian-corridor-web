import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface EconomicData {
  date: string;
  value: string;
}

interface IndicatorData {
  [key: string]: EconomicData[] | { error: string };
}

const INDICATORS = {
  gdp: { name: 'GDP', description: 'Gross Domestic Product' },
  unemployment: { name: 'Unemployment Rate', description: 'Unemployment Rate (%)' },
  inflation: { name: 'Inflation', description: 'Consumer Price Index' },
  interest_rate: { name: 'Federal Funds Rate', description: 'Federal Funds Rate (%)' },
  consumer_confidence: { name: 'Consumer Confidence', description: 'University of Michigan Consumer Sentiment' },
  housing_starts: { name: 'Housing Starts', description: 'Housing Starts (Thousands)' },
  retail_sales: { name: 'Retail Sales', description: 'Advance Retail Sales' },
  industrial_production: { name: 'Industrial Production', description: 'Industrial Production Index' }
};

export default function FredIntegration() {
  const [economicData, setEconomicData] = useState<IndicatorData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['gdp', 'unemployment', 'inflation']);
  const { toast } = useToast();

  const fetchEconomicData = async (indicators: string[] = selectedIndicators) => {
    setIsLoading(true);
    try {
      console.log('📊 Fetching FRED economic data...');
      
      const { data, error } = await supabase.functions.invoke('fred-api-integration', {
        body: {
          operation: 'fetch_indicators',
          indicators,
          limit: 50
        }
      });

      if (error) throw error;

      if (data?.success) {
        setEconomicData(data.data);
        toast({
          title: "Data Updated",
          description: `Fetched latest data for ${indicators.length} economic indicators`,
        });
      } else {
        throw new Error(data?.error || 'Failed to fetch data');
      }
    } catch (error: any) {
      console.error('❌ FRED data fetch error:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to fetch economic data',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEconomicData();
  }, []);

  const formatChartData = (data: EconomicData[]) => {
    return data
      .filter(item => item.value !== '.')
      .slice(-20) // Last 20 data points
      .map(item => ({
        date: new Date(item.date).toLocaleDateString(),
        value: parseFloat(item.value)
      }))
      .reverse();
  };

  const getLatestValue = (data: EconomicData[]) => {
    const validData = data.filter(item => item.value !== '.');
    return validData.length > 0 ? parseFloat(validData[0].value) : null;
  };

  const getTrend = (data: EconomicData[]) => {
    const validData = data.filter(item => item.value !== '.').slice(0, 2);
    if (validData.length < 2) return 'neutral';
    const latest = parseFloat(validData[0].value);
    const previous = parseFloat(validData[1].value);
    return latest > previous ? 'up' : latest < previous ? 'down' : 'neutral';
  };

  const renderIndicatorCard = (indicatorKey: string) => {
    const indicator = INDICATORS[indicatorKey];
    const data = economicData[indicatorKey];
    
    if (!data || 'error' in data) {
      return (
        <Card key={indicatorKey} className="border-destructive/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              {indicator.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {'error' in data ? data.error : 'No data available'}
            </p>
          </CardContent>
        </Card>
      );
    }

    const latestValue = getLatestValue(data);
    const trend = getTrend(data);
    const chartData = formatChartData(data);

    return (
      <Card key={indicatorKey}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            {indicator.name}
            {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
            {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
            {trend === 'neutral' && <Activity className="h-4 w-4 text-blue-500" />}
          </CardTitle>
          <CardDescription className="text-xs">{indicator.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {latestValue !== null ? latestValue.toLocaleString() : 'N/A'}
            </div>
            {chartData.length > 0 && (
              <div className="h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDetailedChart = (indicatorKey: string) => {
    const indicator = INDICATORS[indicatorKey];
    const data = economicData[indicatorKey];
    
    if (!data || 'error' in data) {
      return (
        <Card key={indicatorKey}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              {indicator.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {'error' in data ? data.error : 'No data available'}
            </p>
          </CardContent>
        </Card>
      );
    }

    const chartData = formatChartData(data);

    return (
      <Card key={indicatorKey}>
        <CardHeader>
          <CardTitle>{indicator.name}</CardTitle>
          <CardDescription>{indicator.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">FRED Economic Data</h2>
          <p className="text-muted-foreground">
            Real-time economic indicators from the Federal Reserve Economic Data (FRED) API
          </p>
        </div>
        <Button 
          onClick={() => fetchEconomicData()} 
          disabled={isLoading}
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Charts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedIndicators.map(renderIndicatorCard)}
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {selectedIndicators.map(renderDetailedChart)}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Economic Indicators</CardTitle>
              <CardDescription>
                Choose which economic indicators to display and monitor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(INDICATORS).map(([key, indicator]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={key}
                        checked={selectedIndicators.includes(key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIndicators([...selectedIndicators, key]);
                          } else {
                            setSelectedIndicators(selectedIndicators.filter(i => i !== key));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={key} className="text-sm font-medium">
                        {indicator.name}
                      </label>
                    </div>
                  ))}
                </div>
                <Button onClick={() => fetchEconomicData(selectedIndicators)} disabled={isLoading}>
                  Update Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}