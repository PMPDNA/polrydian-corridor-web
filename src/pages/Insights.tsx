import { Navigation } from "@/components/Navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedEconomicInsights } from "@/components/EnhancedEconomicInsights";
import { CorridorEconomicsIntelligence } from "@/components/CorridorEconomicsIntelligence";
import { CSISAnalysisFeed } from "@/components/CSISAnalysisFeed";
import { TradeGuysPodcast } from "@/components/TradeGuysPodcast";
import { PolicyNewsUpdates } from "@/components/PolicyNewsUpdates";
import InsightsDashboard from "@/components/InsightsDashboard";

import EconomicDataRefresh from "@/components/EconomicDataRefresh";
import { 
  Search, 
  Globe, 
  TrendingUp, 
  ExternalLink,
  Calendar,
  Clock,
  RefreshCw
} from "lucide-react";

interface InsightItem {
  id: string;
  title: string;
  content: string;
  sources: string[];
  relatedQuestions: string[];
  timestamp: string;
  category: string;
}

import { EnhancedSEO } from "@/components/EnhancedSEO";
import heroImage from "@/assets/polrydian-hero-bg.jpg";

export default function Insights() {
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Topics', icon: Globe },
    { id: 'trade', label: 'Trade Policy', icon: TrendingUp },
    { id: 'corridor', label: 'Corridor Economics', icon: Globe },
    { id: 'geopolitical', label: 'Geopolitical Analysis', icon: TrendingUp }
  ];

  const defaultQueries = [
    'Latest CSIS analysis on trade corridors and supply chain resilience',
    'Current geopolitical developments affecting global trade routes',
    'Economic policy updates from CSIS Trade Guys podcast',
    'Infrastructure investment trends in emerging markets',
    'Food security and agricultural trade developments'
  ];

  const fetchInsights = async (query: string, category: string = 'all') => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate and sanitize input
      const sanitizedQuery = query.trim()
      if (sanitizedQuery.length < 3) {
        setError('Query must be at least 3 characters long')
        return
      }
      
      if (sanitizedQuery.length > 500) {
        setError('Query is too long (max 500 characters)')
        return
      }
      
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('You must be logged in to access insights')
        return
      }
      
      let searchSources = ['csis.org', 'tradeguys.org'];
      
      if (category !== 'all') {
        switch (category) {
          case 'trade':
            searchSources = ['csis.org', 'tradeguys.org', 'ustr.gov'];
            break;
          case 'corridor':
            searchSources = ['csis.org', 'worldbank.org', 'adb.org'];
            break;
          case 'geopolitical':
            searchSources = ['csis.org', 'foreignaffairs.com', 'cfr.org'];
            break;
        }
      }

      const { data, error } = await supabase.functions.invoke('search-economic-intelligence', {
        body: { 
          query: sanitizedQuery,
          sources: searchSources
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      const newInsight: InsightItem = {
        id: Date.now().toString(),
        title: sanitizedQuery,
        content: data.content,
        sources: data.sources || [],
        relatedQuestions: data.relatedQuestions || [],
        timestamp: new Date().toISOString(),
        category
      };

      setInsights(prev => [newInsight, ...prev.slice(0, 9)]); // Keep last 10
    } catch (error: any) {
      console.error('Error fetching insights:', error);
      
      if (error.message?.includes('Authentication required')) {
        setError('Please log in to access economic insights')
      } else if (error.message?.includes('Rate limit exceeded')) {
        setError('Too many requests. Please wait a few minutes before trying again.')
      } else if (error.message?.includes('PERPLEXITY_API_KEY')) {
        setError('Perplexity API key not configured. Please contact the administrator.')
      } else {
        setError('Failed to fetch insights. Please try again.')
      }
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultInsights = async () => {
    for (const query of defaultQueries.slice(0, 3)) {
      await fetchInsights(query);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
    }
  };

  useEffect(() => {
    // Don't auto-load on mount to avoid API calls without API key
    // loadDefaultInsights();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchInsights(searchQuery, selectedCategory);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <EnhancedSEO 
        title="Economic Insights | FRED, CSIS, Trade Policy"
        description="Real-time economic indicators, CSIS analysis, Trade Guys podcast, and policy updates for corridor economics."
        keywords={["economic insights","FRED","CSIS","Trade Guys","policy updates","corridor economics","Polrydian"]}
        image={heroImage}
        url={`${window.location.origin}/insights`}
      />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <Breadcrumbs />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-4">Economic Insights</h1>
          <p className="text-muted-foreground max-w-3xl">
            Real-time economic analysis and strategic insights powered by CSIS, Trade Guys, 
            and other leading economic policy sources. Get current intelligence on corridor economics, 
            trade policy, and geopolitical developments.
          </p>
        </div>


        {/* Economic Data Refresh Controls */}
        <section className="mb-12">
          <EconomicDataRefresh />
        </section>

        {/* Enhanced Economic Insights - Single Unified Display */}
        <section className="mb-12">
          <EnhancedEconomicInsights />
        </section>

        {/* Economic Indicators Dashboard */}
        <section className="mb-12">
          <InsightsDashboard />
        </section>


        {/* CSIS Analysis, Trade Guys Podcast, and Policy Updates */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <CSISAnalysisFeed />
            <TradeGuysPodcast />
            <PolicyNewsUpdates />
          </div>
        </section>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2 p-4 h-auto"
            >
              <category.icon className="h-4 w-4" />
              <span className="text-sm">{category.label}</span>
            </Button>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-destructive">
                <span className="text-sm font-medium">Error:</span>
                <span className="text-sm">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Insights Feed */}
        <div className="space-y-6">
          {insights.length === 0 && !loading && !error && (
            <Card className="text-center p-8">
              <CardContent>
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ready for Economic Intelligence</h3>
                <p className="text-muted-foreground mb-4">
                  Search for specific economic insights or explore curated topics from CSIS and other leading sources.
                </p>
                <p className="text-sm text-muted-foreground">
                  Configure the Perplexity API key to start fetching real-time economic analysis.
                </p>
              </CardContent>
            </Card>
          )}

          {insights.map((insight) => (
            <Card key={insight.id} className="shadow-elegant">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{insight.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(insight.timestamp)}
                      </div>
                      <Badge variant="secondary">{insight.category}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-muted-foreground mb-4">
                  {insight.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3">{paragraph}</p>
                  ))}
                </div>

                {insight.relatedQuestions.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2">Related Questions:</h4>
                    <div className="space-y-1">
                      {insight.relatedQuestions.slice(0, 3).map((question, index) => (
                        <button
                          key={index}
                          onClick={() => fetchInsights(question)}
                          className="block w-full text-left text-sm text-accent hover:underline p-2 hover:bg-muted/50 rounded"
                          disabled={loading}
                        >
                          • {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {insight.sources.length > 0 && (
                  <div className="border-t border-border pt-3">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <ExternalLink className="h-3 w-3" />
                      Sources:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {insight.sources.slice(0, 3).map((source, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {source.replace('https://', '').replace('www.', '')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {loading && insights.length > 0 && (
          <div className="text-center py-8">
            <LoadingSpinner />
            <p className="text-sm text-muted-foreground mt-2">Fetching latest insights...</p>
          </div>
        )}
      </main>
    </div>
  );
}