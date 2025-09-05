import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FeaturedArticle {
  id: string;
  title: string;
  content?: string;
  meta_description?: string;
  featured_image: string;
  slug?: string;
  category?: string;
  published_at?: string;
  created_at: string;
  reading_time_minutes?: number;
}

export function useFeaturedArticles(limit: number = 5) {
  return useQuery({
    queryKey: ['featured-articles', limit],
    queryFn: async (): Promise<FeaturedArticle[]> => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          content,
          meta_description,
          featured_image,
          slug,
          category,
          published_at,
          created_at,
          reading_time_minutes
        `)
        .eq('status', 'published')
        .not('featured_image', 'is', null)
        .neq('featured_image', '')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching featured articles:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}