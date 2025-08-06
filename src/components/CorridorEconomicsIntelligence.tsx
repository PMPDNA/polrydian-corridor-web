import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  Globe, 
  Zap, 
  ArrowUpRight, 
  RefreshCw,
  BarChart3,
  Ship,
  Factory,
  Banknote
} from 'lucide-react';

interface Insight {
  id: string;
  title: string;
  content: string;
  data_source: string;
  series_id: string;
  indicator_type: string;
  region: string;
  chart_config: any;
  is_published: boolean;
  updated_at: string;
}

const corridorModals = [
  {
    id: 'capital-flows',
    title: 'Capital Flows',
    icon: Banknote,
    description: 'Track investment patterns and capital movement through economic corridors',
    color: 'from-green-500/20 to-emerald-500/20'
  },
  {
    id: 'technology-transfer',
    title: 'Technology Transfer',
    icon: Zap,
    description: 'Monitor technology diffusion and innovation pathways',
    color: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    id: 'strategic-pathways',
    title: 'Strategic Pathways',
    icon: Globe,
    description: 'Analyze key trade routes and infrastructure development',
    color: 'from-purple-500/20 to-pink-500/20'
  }
];

export function CorridorEconomicsIntelligence() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedModal, setSelectedModal] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('is_published', true)
        .order('updated_at', { ascending: false })
        .limit(12);

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  const triggerDataCollection = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-data-collection');
      
      if (error) throw error;
      
      toast({
        title: "Data Collection Started",
        description: "Enhanced economic data is being collected from multiple sources.",
      });
      
      // Refresh insights after collection
      setTimeout(() => {
        fetchInsights();
        setLoading(false);
      }, 3000);
      
    } catch (error: any) {
      console.error('Error triggering data collection:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to start data collection",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const getIndicatorIcon = (type: string) => {
    switch (type) {
      case 'economic': return TrendingUp;
      case 'supply_chain': return Factory;
      case 'shipping': return Ship;
      default: return BarChart3;
    }
  };

  const formatValue = (value: string, config: any) => {
    if (!value || value === '.') return 'N/A';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    
    if (config?.latest_value && Math.abs(numValue) > 1000) {
      return new Intl.NumberFormat('en-US', { 
        notation: 'compact',
        maximumFractionDigits: 1 
      }).format(numValue);
    }
    
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2
    }).format(numValue);
  };

  const getTrendColor = (changePercent: number) => {
    if (changePercent > 0) return 'text-green-600';
    if (changePercent < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Corridor Economics Intelligence</h2>
          <p className="text-muted-foreground">
            Real-time economic indicators and corridor analysis powered by multiple data sources
          </p>
        </div>
        <Button 
          onClick={triggerDataCollection} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Collecting...' : 'Update Data'}
        </Button>
      </div>

      {/* Corridor Modals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {corridorModals.map((modal) => {
          const IconComponent = modal.icon;
          return (
            <Dialog key={modal.id}>
              <DialogTrigger asChild>
                <Card className={`cursor-pointer transition-all duration-300 hover:shadow-lg bg-gradient-to-br ${modal.color} border-primary/20 hover:border-primary/40`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{modal.title}</h3>
                        <p className="text-sm text-muted-foreground">{modal.description}</p>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5" />
                    {modal.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-muted-foreground">{modal.description}</p>
                  
                  {/* Relevant insights for this modal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insights
                      .filter(insight => {
                        if (modal.id === 'capital-flows') return insight.indicator_type === 'economic';
                        if (modal.id === 'technology-transfer') return insight.indicator_type === 'supply_chain';
                        if (modal.id === 'strategic-pathways') return insight.indicator_type === 'shipping';
                        return false;
                      })
                      .slice(0, 4)
                      .map((insight) => {
                        const IconComp = getIndicatorIcon(insight.indicator_type);
                        return (
                          <Card key={insight.id}>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <IconComp className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">{insight.title}</span>
                              </div>
                              <div className="text-2xl font-bold mb-1">
                                {formatValue(insight.chart_config?.latest_value, insight.chart_config)}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {insight.data_source}
                                </Badge>
                                {insight.chart_config?.change_percent && (
                                  <span className={`text-xs ${getTrendColor(insight.chart_config.change_percent)}`}>
                                    {insight.chart_config.change_percent > 0 ? '+' : ''}
                                    {insight.chart_config.change_percent.toFixed(1)}%
                                  </span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                  
                  <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-2">Analysis Framework</h4>
                    <p className="text-sm text-muted-foreground">
                      {modal.id === 'capital-flows' && 
                        "Track foreign direct investment, portfolio flows, and cross-border financing patterns that drive corridor development and economic integration."
                      }
                      {modal.id === 'technology-transfer' && 
                        "Monitor innovation diffusion, supply chain digitization, and technology adoption rates across corridor regions."
                      }
                      {modal.id === 'strategic-pathways' && 
                        "Analyze transportation costs, infrastructure capacity, and trade route efficiency to identify optimal corridor development opportunities."
                      }
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>

      {/* Economic Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {insights.map((insight) => {
          const IconComponent = getIndicatorIcon(insight.indicator_type);
          return (
            <Card key={insight.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium truncate">{insight.title}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {insight.region}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold mb-2">
                  {formatValue(insight.chart_config?.latest_value, insight.chart_config)}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{insight.data_source}</span>
                  {insight.chart_config?.change_percent && (
                    <span className={`font-medium ${getTrendColor(insight.chart_config.change_percent)}`}>
                      {insight.chart_config.change_percent > 0 ? '+' : ''}
                      {insight.chart_config.change_percent.toFixed(1)}%
                    </span>
                  )}
                </div>
                {insight.chart_config?.latest_date && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Updated: {new Date(insight.chart_config.latest_date).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {insights.length === 0 && (
        <Card className="text-center p-8">
          <CardContent>
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Economic Data Available</h3>
            <p className="text-muted-foreground mb-4">
              Click "Update Data" to fetch the latest economic indicators and corridor analysis.
            </p>
            <Button onClick={triggerDataCollection} disabled={loading}>
              {loading ? 'Collecting Data...' : 'Fetch Economic Data'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}