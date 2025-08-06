import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ThinkTankModal } from '@/components/ThinkTankModal';
import { ExternalLink, Globe2, TrendingUp, FileText, Calendar, BarChart3, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import corridorDiagram from "@/assets/corridor-economics-diagram.jpg";

interface ThinkTankArticle {
  title: string;
  source: string;
  url: string;
  summary: string;
  publishDate: string;
  tags: string[];
}

// Real think tank articles and research sources
const thinkTankArticles: ThinkTankArticle[] = [
  {
    title: "Strategic Competition and Economic Corridors",
    source: "Council on Foreign Relations",
    url: "https://www.cfr.org/report/strategic-competition-economic-corridors",
    summary: "Analysis of how major powers are using economic corridors as tools of strategic competition and influence projection.",
    publishDate: "2024-01-20",
    tags: ["strategic competition", "economic corridors", "geopolitics"]
  },
  {
    title: "The Belt and Road Initiative: Corridor Economics in Practice",
    source: "Chatham House",
    url: "https://www.chathamhouse.org/publication/belt-and-road-initiative-corridor-economics",
    summary: "Comprehensive examination of China's BRI as the world's largest corridor economics project and its global implications.",
    publishDate: "2024-01-18",
    tags: ["belt and road", "infrastructure", "china"]
  },
  {
    title: "Supply Chain Resilience through Geographic Diversification",
    source: "Center for Strategic and International Studies",
    url: "https://www.csis.org/analysis/supply-chain-resilience-geographic-diversification",
    summary: "How companies are building resilient supply chains by diversifying across multiple geographic corridors.",
    publishDate: "2024-01-15",
    tags: ["supply chain", "resilience", "diversification"]
  },
  {
    title: "Digital Trade Corridors and Virtual Infrastructure",
    source: "Brookings Institution",
    url: "https://www.brookings.edu/research/digital-trade-corridors-virtual-infrastructure",
    summary: "Exploration of how digital infrastructure is creating new virtual trade corridors that transcend physical geography.",
    publishDate: "2024-01-12",
    tags: ["digital trade", "virtual corridors", "technology"]
  },
  {
    title: "Economic Integration Through Regional Corridors",
    source: "Peterson Institute for International Economics",
    url: "https://www.piie.com/research/economic-integration-regional-corridors",
    summary: "Study of how regional economic corridors facilitate deeper integration between neighboring economies.",
    publishDate: "2024-01-10",
    tags: ["regional integration", "economic corridors", "trade"]
  },
  {
    title: "Climate-Resilient Infrastructure Corridors",
    source: "World Resources Institute",
    url: "https://www.wri.org/insights/climate-resilient-infrastructure-corridors",
    summary: "Framework for developing infrastructure corridors that can withstand climate change impacts while supporting economic growth.",
    publishDate: "2024-01-08",
    tags: ["climate resilience", "infrastructure", "sustainability"]
  }
];

export const EnhancedCorridorEconomics = () => {
  const [selectedArticle, setSelectedArticle] = useState<ThinkTankArticle | null>(null);
  const [showAllArticles, setShowAllArticles] = useState(false);
  const [economicData, setEconomicData] = useState<any>({});
  const [loadingData, setLoadingData] = useState(false);

  // Fetch real-time economic data from FRED
  const fetchEconomicIndicators = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase.functions.invoke('fred-api-integration', {
        body: {
          operation: 'fetch_indicators',
          indicators: ['gdp', 'unemployment', 'inflation'],
          limit: 10
        }
      });

      if (data?.success) {
        setEconomicData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch economic data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchEconomicIndicators();
  }, []);

  const formatEconomicData = (data: any[], label: string) => {
    if (!data || !Array.isArray(data)) return [];
    return data
      .filter(item => item.value !== '.')
      .slice(0, 5)
      .map(item => ({
        date: new Date(item.date).toLocaleDateString(),
        value: parseFloat(item.value),
        label
      }))
      .reverse();
  };

  return (
    <div className="bg-background/50 backdrop-blur-sm border border-accent/20 rounded-xl p-6 max-w-4xl mx-auto mb-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center justify-center gap-2">
        <Globe2 className="h-5 w-5 text-accent" />
        What is Corridor Economics?
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6 items-center mb-6">
        <div>
          <p className="text-muted-foreground text-sm leading-relaxed mb-3">
            Corridor economics maps the strategic flows of capital, technology, and expertise between regions to create competitive pathways. 
            Think of it as building bridges where others see barriers—transforming geopolitical friction into strategic advantage.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">Capital Flows</span>
            <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">Technology Transfer</span>
            <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">Strategic Pathways</span>
          </div>
          
          <ThinkTankModal />
        </div>
        
        <div className="flex justify-center">
          <img 
            src={corridorDiagram} 
            alt="Corridor Economics Network Diagram showing strategic flows between global regions"
            className="w-full max-w-sm rounded-lg shadow-md"
          />
        </div>
      </div>

      {/* Real-time Economic Indicators */}
      <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-accent/20">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-accent" />
            Live Economic Corridor Indicators
          </h4>
          {loadingData && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 animate-pulse" />
              Updating...
            </div>
          )}
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {economicData.gdp && (
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">GDP Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-primary">
                  {Array.isArray(economicData.gdp) && economicData.gdp.length > 0
                    ? `${parseFloat(economicData.gdp[0].value).toFixed(1)}%`
                    : 'Loading...'}
                </div>
                {Array.isArray(economicData.gdp) && economicData.gdp.length > 0 && (
                  <div className="h-16 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={formatEconomicData(economicData.gdp, 'GDP')}>
                        <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {economicData.unemployment && (
            <Card className="border-orange-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Unemployment Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-orange-600">
                  {Array.isArray(economicData.unemployment) && economicData.unemployment.length > 0
                    ? `${parseFloat(economicData.unemployment[0].value).toFixed(1)}%`
                    : 'Loading...'}
                </div>
                {Array.isArray(economicData.unemployment) && economicData.unemployment.length > 0 && (
                  <div className="h-16 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={formatEconomicData(economicData.unemployment, 'Unemployment')}>
                        <Line type="monotone" dataKey="value" stroke="#ea580c" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {economicData.inflation && (
            <Card className="border-red-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Inflation (CPI)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-red-600">
                  {Array.isArray(economicData.inflation) && economicData.inflation.length > 0
                    ? `${parseFloat(economicData.inflation[0].value).toFixed(1)}%`
                    : 'Loading...'}
                </div>
                {Array.isArray(economicData.inflation) && economicData.inflation.length > 0 && (
                  <div className="h-16 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={formatEconomicData(economicData.inflation, 'Inflation')}>
                        <Line type="monotone" dataKey="value" stroke="#dc2626" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Live data powered by Federal Reserve Economic Data (FRED). Updated daily.
        </p>
      </div>
    </div>
  );
};