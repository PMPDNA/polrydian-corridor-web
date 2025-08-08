import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SEOData {
  sitemap: string;
  rss: string;
  lastGenerated: string;
}

export function useSEOManager() {
  // Generate sitemap dynamically
  const generateSitemap = useQuery({
    queryKey: ["sitemap"],
    queryFn: async () => {
      const response = await supabase.functions.invoke('generate-sitemap');
      if (response.error) throw response.error;
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Generate RSS feed dynamically  
  const generateRSS = useQuery({
    queryKey: ["rss"],
    queryFn: async () => {
      const response = await supabase.functions.invoke('generate-rss');
      if (response.error) throw response.error;
      return response.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Get SEO analytics data
  const seoAnalytics = useQuery({
    queryKey: ["seo-analytics"],
    queryFn: async () => {
      // Get article performance data
      const { data: articles, error } = await supabase
        .from("articles")
        .select("id, title, slug, published_at, category, meta_description, keywords")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) throw error;

      // Calculate SEO metrics
      const articlesWithSEO = articles?.map(article => ({
        ...article,
        hasMetaDescription: !!article.meta_description,
        hasKeywords: !!(article.keywords && article.keywords.length > 0),
        hasSlug: !!article.slug,
        titleLength: article.title.length,
        metaDescriptionLength: article.meta_description?.length || 0,
        seoScore: calculateSEOScore(article)
      }));

      return {
        articles: articlesWithSEO,
        totalArticles: articles?.length || 0,
        averageSEOScore: articlesWithSEO ? 
          articlesWithSEO.reduce((sum, article) => sum + article.seoScore, 0) / articlesWithSEO.length : 0
      };
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  return {
    sitemap: generateSitemap.data,
    rss: generateRSS.data,
    seoAnalytics: seoAnalytics.data,
    isLoadingSitemap: generateSitemap.isLoading,
    isLoadingRSS: generateRSS.isLoading,
    isLoadingAnalytics: seoAnalytics.isLoading,
    refetchSitemap: generateSitemap.refetch,
    refetchRSS: generateRSS.refetch,
    refetchAnalytics: seoAnalytics.refetch,
  };
}

function calculateSEOScore(article: any): number {
  let score = 0;
  
  // Title length (optimal: 30-60 characters)
  if (article.title.length >= 30 && article.title.length <= 60) {
    score += 25;
  } else if (article.title.length >= 20 && article.title.length <= 70) {
    score += 15;
  }
  
  // Meta description
  if (article.meta_description) {
    score += 25;
    // Optimal length: 120-160 characters
    if (article.meta_description.length >= 120 && article.meta_description.length <= 160) {
      score += 10;
    }
  }
  
  // Keywords
  if (article.keywords && article.keywords.length > 0) {
    score += 20;
    if (article.keywords.length >= 3 && article.keywords.length <= 8) {
      score += 10;
    }
  }
  
  // Slug
  if (article.slug) {
    score += 20;
  }
  
  return score;
}