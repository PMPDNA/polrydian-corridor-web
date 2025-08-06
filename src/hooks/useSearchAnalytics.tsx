import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAnalytics } from '@/hooks/useAnalytics';

interface SearchQuery {
  id: string;
  query: string;
  results_count: number;
  user_id?: string;
  timestamp: Date;
  filters?: Record<string, any>;
  clicked_results?: string[];
}

interface SearchAnalytics {
  totalSearches: number;
  popularQueries: { query: string; count: number }[];
  averageResultsPerQuery: number;
  clickThroughRate: number;
  topClickedResults: { title: string; clicks: number }[];
}

interface SearchMetrics {
  searchTime: number;
  resultsCount: number;
  hasResults: boolean;
}

export const useSearchAnalytics = () => {
  const [analytics, setAnalytics] = useState<SearchAnalytics>({
    totalSearches: 0,
    popularQueries: [],
    averageResultsPerQuery: 0,
    clickThroughRate: 0,
    topClickedResults: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const { track } = useAnalytics();

  // Track search query
  const trackSearch = useCallback(async (
    query: string, 
    resultsCount: number, 
    searchTime: number,
    filters?: Record<string, any>
  ) => {
    const searchData: Omit<SearchQuery, 'id'> = {
      query: query.toLowerCase().trim(),
      results_count: resultsCount,
      timestamp: new Date(),
      filters
    };

    try {
      // Store in Supabase if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('search_queries').insert({
          ...searchData,
          user_id: user.id
        });
      }

      // Track with analytics
      track('search_performed', window.location.pathname);
      track('search_metrics', window.location.pathname);

      // Store locally for analytics
      const storedSearches = JSON.parse(localStorage.getItem('search_analytics') || '[]');
      const searchEntry = {
        ...searchData,
        id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        searchTime,
        hasResults: resultsCount > 0
      };
      
      storedSearches.push(searchEntry);
      
      // Keep only last 1000 searches
      if (storedSearches.length > 1000) {
        storedSearches.splice(0, storedSearches.length - 1000);
      }
      
      localStorage.setItem('search_analytics', JSON.stringify(storedSearches));
      
      // Refresh analytics
      await loadAnalytics();
      
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }, [track]);

  // Track result click
  const trackResultClick = useCallback(async (query: string, resultId: string, resultTitle: string) => {
    try {
      // Update the search query with clicked result
      const storedSearches = JSON.parse(localStorage.getItem('search_analytics') || '[]');
      const searchIndex = storedSearches.findIndex((s: any) => 
        s.query === query.toLowerCase().trim() && 
        Date.now() - new Date(s.timestamp).getTime() < 300000 // 5 minutes
      );
      
      if (searchIndex !== -1) {
        if (!storedSearches[searchIndex].clicked_results) {
          storedSearches[searchIndex].clicked_results = [];
        }
        storedSearches[searchIndex].clicked_results.push(resultId);
        localStorage.setItem('search_analytics', JSON.stringify(storedSearches));
      }

      // Track click
      track('search_result_click', window.location.pathname);
      
      // Refresh analytics
      await loadAnalytics();
      
    } catch (error) {
      console.error('Error tracking result click:', error);
    }
  }, [track]);

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedSearches = JSON.parse(localStorage.getItem('search_analytics') || '[]');
      
      if (storedSearches.length === 0) {
        setAnalytics({
          totalSearches: 0,
          popularQueries: [],
          averageResultsPerQuery: 0,
          clickThroughRate: 0,
          topClickedResults: []
        });
        return;
      }

      // Calculate analytics
      const totalSearches = storedSearches.length;
      const totalResults = storedSearches.reduce((sum: number, search: any) => sum + search.results_count, 0);
      const averageResultsPerQuery = totalResults / totalSearches;

      // Popular queries
      const queryMap = new Map<string, number>();
      storedSearches.forEach((search: any) => {
        const query = search.query;
        queryMap.set(query, (queryMap.get(query) || 0) + 1);
      });
      
      const popularQueries = Array.from(queryMap.entries())
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Click through rate
      const searchesWithClicks = storedSearches.filter((search: any) => 
        search.clicked_results && search.clicked_results.length > 0
      ).length;
      const clickThroughRate = (searchesWithClicks / totalSearches) * 100;

      // Top clicked results (mock data for now)
      const topClickedResults = [
        { title: 'Corridor Economics Overview', clicks: 15 },
        { title: 'Supply Chain Analysis', clicks: 12 },
        { title: 'Geopolitical Risk Assessment', clicks: 8 },
        { title: 'Market Entry Strategies', clicks: 6 },
        { title: 'Economic Indicators Dashboard', clicks: 4 }
      ];

      setAnalytics({
        totalSearches,
        popularQueries,
        averageResultsPerQuery: Math.round(averageResultsPerQuery * 100) / 100,
        clickThroughRate: Math.round(clickThroughRate * 100) / 100,
        topClickedResults
      });

    } catch (error) {
      console.error('Error loading search analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get search suggestions based on popular queries
  const getSearchSuggestions = useCallback((input: string): string[] => {
    if (!input || input.length < 2) return [];
    
    const suggestions = analytics.popularQueries
      .filter(({ query }) => query.toLowerCase().includes(input.toLowerCase()))
      .map(({ query }) => query)
      .slice(0, 5);
    
    return suggestions;
  }, [analytics.popularQueries]);

  // Clear analytics data
  const clearAnalytics = useCallback(() => {
    localStorage.removeItem('search_analytics');
    setAnalytics({
      totalSearches: 0,
      popularQueries: [],
      averageResultsPerQuery: 0,
      clickThroughRate: 0,
      topClickedResults: []
    });
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    analytics,
    isLoading,
    trackSearch,
    trackResultClick,
    loadAnalytics,
    getSearchSuggestions,
    clearAnalytics
  };
};
