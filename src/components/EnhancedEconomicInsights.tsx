import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  RefreshCw, 
  AlertCircle, 
  ExternalLink,
  Info,
  Calendar,
  Database
} from "lucide-react";
import { format } from "date-fns";

interface Insight {
  id: string;
  title: string;
  content: string;
  data_source: string;
  series_id: string;
  indicator_type: string;
  region: string;
  data_points: any;
  chart_config: any;
  updated_at: string;
  is_published: boolean;
}

interface EconomicMethodology {
  [key: string]: {
    description: string;
    calculation: string;
    interpretation: string;
    source_url: string;
    update_frequency: string;
    importance: 'high' | 'medium' | 'low';
  };
}

const ECONOMIC_METHODOLOGIES: EconomicMethodology = {
  'gdp': {
    description: 'Gross Domestic Product measures the total economic output of a country, representing the monetary value of all finished goods and services produced.',
    calculation: 'Sum of consumption + investment + government spending + (exports - imports), adjusted for inflation (real GDP)',
    interpretation: 'Higher GDP indicates stronger economic activity. Quarter-over-quarter growth rates above 2-3% annually suggest healthy expansion.',
    source_url: 'https://fred.stlouisfed.org/series/GDPC1',
    update_frequency: 'Quarterly',
    importance: 'high'
  },
  'unemployment': {
    description: 'Unemployment rate represents the percentage of the labor force that is jobless and actively seeking employment.',
    calculation: '(Number of unemployed persons / Total labor force) × 100',
    interpretation: 'Lower unemployment typically indicates a stronger economy. Rates below 4% often signal full employment, while above 6% may indicate economic stress.',
    source_url: 'https://fred.stlouisfed.org/series/UNRATE',
    update_frequency: 'Monthly',
    importance: 'high'
  },
  'inflation': {
    description: 'Consumer Price Index measures the average change in prices paid by consumers for goods and services over time.',
    calculation: '((Current Period CPI - Previous Period CPI) / Previous Period CPI) × 100',
    interpretation: 'Moderate inflation (2-3%) indicates healthy economic growth. High inflation (>4%) may erode purchasing power and require monetary intervention.',
    source_url: 'https://fred.stlouisfed.org/series/CPIAUCSL',
    update_frequency: 'Monthly',
    importance: 'high'
  },
  'interest_rates': {
    description: 'Federal Funds Rate is the interest rate at which banks lend to each other overnight, set by the Federal Reserve.',
    calculation: 'Set by Federal Open Market Committee based on economic conditions and monetary policy objectives',
    interpretation: 'Higher rates slow economic growth but combat inflation. Lower rates stimulate borrowing and investment but may fuel inflation.',
    source_url: 'https://fred.stlouisfed.org/series/FEDFUNDS',
    update_frequency: 'Monthly',
    importance: 'high'
  },
  'consumer_sentiment': {
    description: 'University of Michigan Consumer Sentiment measures consumer confidence in the overall state of the economy.',
    calculation: 'Survey-based index using responses about current and future economic conditions, normalized to 1966=100',
    interpretation: 'Values above 80 indicate optimism, below 60 suggest pessimism. Changes of 5+ points signal significant shifts in consumer confidence.',
    source_url: 'https://fred.stlouisfed.org/series/UMCSENT',
    update_frequency: 'Monthly',
    importance: 'medium'
  },
  'housing': {
    description: 'Housing Starts measure the number of new residential construction projects that have begun during a specific period.',
    calculation: 'Annualized number of housing units started in thousands, seasonally adjusted',
    interpretation: 'Healthy housing market: 1.2-1.6M annual starts. Below 1M indicates weak demand; above 1.8M may signal overheating.',
    source_url: 'https://fred.stlouisfed.org/series/HOUST',
    update_frequency: 'Monthly',
    importance: 'medium'
  },
  'industrial_production': {
    description: 'Industrial Production Index measures real output for manufacturing, mining, electric, and gas utilities.',
    calculation: 'Index based on physical volume of production, weighted by value-added proportions (2017=100)',
    interpretation: 'Growth above 2% annually indicates expanding manufacturing. Declining values suggest industrial recession.',
    source_url: 'https://fred.stlouisfed.org/series/INDPRO',
    update_frequency: 'Monthly',
    importance: 'medium'
  },
  'retail_sales': {
    description: 'Retail Sales measure consumer spending at retail establishments, excluding services.',
    calculation: 'Monthly sales data from retail establishments, seasonally adjusted and inflation-adjusted',
    interpretation: 'Growth of 3-5% annually indicates healthy consumer spending. Negative growth may signal recession.',
    source_url: 'https://fred.stlouisfed.org/series/RSXFS',
    update_frequency: 'Monthly',
    importance: 'medium'
  },
  'supply_chain': {
    description: 'Global Supply Chain Pressure Index measures the extent of global supply chain disruptions.',
    calculation: 'Composite index using shipping costs, delivery times, and supply chain survey data',
    interpretation: 'Values above 1 indicate above-average pressure. Values above 2 suggest severe disruptions affecting global trade.',
    source_url: 'https://fred.stlouisfed.org/series/GSCPI',
    update_frequency: 'Monthly',
    importance: 'high'
  }
};

export function EnhancedEconomicInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [selectedMethodology, setSelectedMethodology] = useState<string>("");
  const { toast } = useToast();

  const loadInsights = async () => {
    try {
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('is_published', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const processedData = data.map((insight: any) => ({
          ...insight,
          data_points: Array.isArray(insight.data_points) ? insight.data_points : []
        }));
        setInsights(processedData);
        setLastUpdated(data[0].updated_at);
      }
    } catch (error: any) {
      console.error('Error loading insights:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load economic insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAllData = async () => {
    setLoading(true);
    try {
      // Call enhanced data collection function
      const { error } = await supabase.functions.invoke('enhanced-data-collection', {
        body: { sources: ['fred', 'gscpi', 'shipping'] }
      });

      if (error) throw error;

      toast({
        title: "Data Updated",
        description: "Economic data has been refreshed successfully.",
      });

      // Reload insights after update
      setTimeout(() => {
        loadInsights();
      }, 2000);

    } catch (error: any) {
      console.error('Error updating data:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update economic data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: string, indicatorType: string): string => {
    if (!value || value === 'N/A') return 'Data Unavailable';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'Invalid Data';

    switch (indicatorType.toLowerCase()) {
      case 'inflation':
      case 'unemployment':
      case 'interest_rates':
        return `${numValue.toFixed(2)}%`;
      case 'gdp':
        return `$${(numValue / 1000).toFixed(1)}T`;
      case 'housing':
        return `${(numValue / 1000).toFixed(1)}K units`;
      case 'supply_chain':
        return `${numValue.toFixed(2)} (Index)`;
      default:
        return numValue.toFixed(2);
    }
  };

  const getIndicatorColor = (indicatorType: string): string => {
    switch (indicatorType.toLowerCase()) {
      case 'gdp':
      case 'retail_sales':
      case 'industrial_production':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-200';
      case 'inflation':
      case 'unemployment':
        return 'bg-amber-500/10 text-amber-700 border-amber-200';
      case 'interest_rates':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'consumer_sentiment':
        return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'housing':
        return 'bg-orange-500/10 text-orange-700 border-orange-200';
      case 'supply_chain':
        return 'bg-red-500/10 text-red-700 border-red-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getTrendIcon = (insight: Insight) => {
    if (!insight.data_points || insight.data_points.length < 2) {
      return <Minus className="h-4 w-4" />;
    }

    const latest = parseFloat(insight.data_points[insight.data_points.length - 1]?.value || '0');
    const previous = parseFloat(insight.data_points[insight.data_points.length - 2]?.value || '0');

    if (latest > previous) return <TrendingUp className="h-4 w-4 text-emerald-600" />;
    if (latest < previous) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4" />;
  };

  const getSourceUrl = (dataSource: string): string => {
    const sourceUrls: Record<string, string> = {
      'FRED': 'https://fred.stlouisfed.org/',
      'GSCPI': 'https://fred.stlouisfed.org/series/GSCPI',
      'Shipping': 'https://www.freightos.com/',
      'Eurostat': 'https://ec.europa.eu/eurostat',
      'World Bank': 'https://data.worldbank.org/',
      'UN Comtrade': 'https://comtrade.un.org/'
    };
    return sourceUrls[dataSource] || '#';
  };

  const getMethodologyKey = (indicatorType: string, seriesId: string): string => {
    const typeMap: Record<string, string> = {
      'gdp': 'gdp',
      'unemployment': 'unemployment', 
      'inflation': 'inflation',
      'interest_rates': 'interest_rates',
      'consumer_sentiment': 'consumer_sentiment',
      'housing': 'housing',
      'industrial_production': 'industrial_production',
      'retail_sales': 'retail_sales',
      'supply_chain': 'supply_chain'
    };
    
    return typeMap[indicatorType.toLowerCase()] || 
           typeMap[seriesId.toLowerCase()] || 
           'gdp';
  };

  useEffect(() => {
    loadInsights();
  }, []);

  if (loading && insights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Loading economic intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground">Economic Intelligence Dashboard</h3>
          <p className="text-muted-foreground">
            Real-time economic indicators with strategic analysis and methodology
          </p>
          {lastUpdated && (
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Last updated: {format(new Date(lastUpdated), 'PPP p')}
              </span>
            </div>
          )}
        </div>
        <Button 
          onClick={updateAllData} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Update All Data
        </Button>
      </div>

      {/* Insights Grid */}
      {insights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insights.map((insight) => {
            const latestValue = insight.data_points?.[insight.data_points.length - 1]?.value || 'N/A';
            const methodologyKey = getMethodologyKey(insight.indicator_type, insight.series_id);
            const methodology = ECONOMIC_METHODOLOGIES[methodologyKey];
            
            return (
              <Card key={insight.id} className="shadow-elegant hover:shadow-glow transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    {getTrendIcon(insight)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getIndicatorColor(insight.indicator_type)}>
                      {insight.indicator_type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    {methodology && (
                      <Badge variant="outline" className={`text-xs ${
                        methodology.importance === 'high' ? 'border-red-200 text-red-700' :
                        methodology.importance === 'medium' ? 'border-amber-200 text-amber-700' :
                        'border-gray-200 text-gray-700'
                      }`}>
                        {methodology.importance.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {formatValue(latestValue, insight.indicator_type)}
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.content}</p>
                  </div>

                  {/* Methodology Section */}
                  {methodology && (
                    <div className="space-y-3 pt-3 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMethodology(
                          selectedMethodology === insight.id ? '' : insight.id
                        )}
                        className="w-full flex items-center gap-2 justify-start"
                      >
                        <Info className="h-4 w-4" />
                        {selectedMethodology === insight.id ? 'Hide' : 'Show'} Methodology
                      </Button>
                      
                      {selectedMethodology === insight.id && (
                        <div className="space-y-2 text-sm">
                          <div>
                            <strong className="text-foreground">Description:</strong>
                            <p className="text-muted-foreground mt-1">{methodology.description}</p>
                          </div>
                          <div>
                            <strong className="text-foreground">Calculation:</strong>
                            <p className="text-muted-foreground mt-1">{methodology.calculation}</p>
                          </div>
                          <div>
                            <strong className="text-foreground">Interpretation:</strong>
                            <p className="text-muted-foreground mt-1">{methodology.interpretation}</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Updated: {methodology.update_frequency}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Source Attribution */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Source: {insight.data_source}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(getSourceUrl(insight.data_source), '_blank')}
                      className="flex items-center gap-1 text-xs"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Economic Data Available</h3>
          <p className="text-muted-foreground mb-4">
            Economic insights are not currently available. Click the button below to fetch the latest data.
          </p>
          <Button onClick={updateAllData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Fetch Economic Data
          </Button>
        </Card>
      )}

      {/* Data Sources Footer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Sources & Attribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <a href="https://fred.stlouisfed.org/" target="_blank" rel="noopener noreferrer" 
                 className="text-accent hover:text-accent/80 underline">
                Federal Reserve Economic Data (FRED)
              </a>
            </div>
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <a href="https://fred.stlouisfed.org/series/GSCPI" target="_blank" rel="noopener noreferrer"
                 className="text-accent hover:text-accent/80 underline">
                Global Supply Chain Pressure Index
              </a>
            </div>
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <a href="https://www.freightos.com/" target="_blank" rel="noopener noreferrer"
                 className="text-accent hover:text-accent/80 underline">
                Freightos Baltic Index (Shipping)
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}