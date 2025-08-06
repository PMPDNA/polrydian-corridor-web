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
      
      // For now, allow public access - authentication can be added later for premium features
      
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


        {/* Corridor Economics Intelligence */}
        <section className="mb-12">
          <CorridorEconomicsIntelligence />
        </section>


        {/* Economic Data Refresh Controls */}
        <section className="mb-12">
          <EconomicDataRefresh />
        </section>


        {/* CSIS Analysis, Trade Guys Podcast, and Policy Updates */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <CSISAnalysisFeed />
            <TradeGuysPodcast />
            <PolicyNewsUpdates />
          </div>
        </section>


      </main>
    </div>
  );
}