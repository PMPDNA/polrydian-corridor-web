import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ThinkTankModal } from './ThinkTankModal';
import { CorridorEconomicsModal } from './CorridorEconomicsModals';
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
            {['Capital Flows', 'Technology Transfer', 'Strategic Pathways'].map((tag, index) => (
              <CorridorEconomicsModal 
                key={index}
                type={tag.toLowerCase().replace(/\s+/g, '-') as 'capital-flows' | 'technology-transfer' | 'strategic-pathways'}
              >
                <Badge 
                  variant="secondary" 
                  className="bg-primary/80 hover:bg-primary text-primary-foreground cursor-pointer transition-colors px-4 py-2 font-medium"
                >
                  {tag}
                </Badge>
              </CorridorEconomicsModal>
            ))}
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

    </div>
  );
};