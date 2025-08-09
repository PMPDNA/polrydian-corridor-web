import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useErrorHandler } from "@/utils/errorHandling";
import { useToast } from "@/hooks/use-toast";

// Unified Article interface
export interface Article {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  published_at?: string;
  user_id: string;
  meta_description?: string;
  keywords?: string[];
  slug?: string;
  featured_image?: string;
  content_images?: string[];
  video_url?: string;
  video_thumbnail?: string;
  reading_time_minutes?: number;
  reference_sources?: any[];
  related_articles?: string[];
  auto_publish_linkedin?: boolean;
  linkedin_url?: string;
  category?: string;
}

// Archive parameters for pagination and filtering
export interface ArticleArchiveParams {
  page: number;
  pageSize: number;
  category?: string;
  author?: string;
  search?: string;
  sort?: "newest" | "oldest";
  dateFrom?: string;
  dateTo?: string;
}

// Unified hook for article data management
export function useUnifiedArticles() {
  const { user, isAdmin } = useSupabaseAuth();
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();
  const { toast } = useToast();

  // Get all articles (with proper RLS filtering)
  const useArticles = () => {
    return useQuery({
      queryKey: ["articles", user?.id, isAdmin],
      queryFn: async () => {
        let query = supabase
          .from("articles")
          .select("*")
          .order("created_at", { ascending: false });

        // For non-admins, only show published articles
        if (!user || !isAdmin) {
          query = query.eq("status", "published");
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Article[];
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  // Paginated article archive with filters
  const useArticleArchive = (params: ArticleArchiveParams) => {
    return useQuery({
      queryKey: ["articles-archive", params],
      queryFn: async () => {
        const { page, pageSize, category, author, search, sort = "newest", dateFrom, dateTo } = params;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
          .from("articles")
          .select("*", { count: "exact" })
          .eq("status", "published");

        // Apply filters
        if (category && category !== "All") {
          query = query.eq("category", category);
        }
        
        if (author) {
          query = query.eq("user_id", author);
        }

        if (search && search.trim()) {
          query = query.or(`title.ilike.%${search}%, content.ilike.%${search}%, meta_description.ilike.%${search}%`);
        }

        if (dateFrom) {
          query = query.gte("published_at", dateFrom);
        }

        if (dateTo) {
          query = query.lte("published_at", dateTo);
        }

        // Sorting
        const orderColumn = sort === "newest" ? "published_at" : "published_at";
        const ascending = sort === "oldest";
        query = query.order(orderColumn, { ascending }).order("created_at", { ascending });

        const { data, error, count } = await query.range(from, to);
        if (error) throw error;

        return { 
          items: data || [], 
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize)
        };
      },
      placeholderData: (prev) => prev,
      staleTime: 1000 * 60 * 2, // 2 minutes for archive
    });
  };

  // Get single article
  const useArticle = (id: string) => {
    return useQuery({
      queryKey: ["article", id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error("Article not found");

        // Check if user can view this article
        if (data.status !== "published" && (!user || (data.user_id !== user.id && !isAdmin))) {
          throw new Error("Article not found");
        }

        return data as any;
      },
      staleTime: 1000 * 60 * 10, // 10 minutes
    });
  };

  // Get article by slug
  const useArticleBySlug = (slug: string) => {
    return useQuery({
      queryKey: ["article-slug", slug],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error("Article not found");

        // Check if user can view this article
        if (data.status !== "published" && (!user || (data.user_id !== user.id && !isAdmin))) {
          throw new Error("Article not found");
        }

        return data as any;
      },
      staleTime: 1000 * 60 * 10, // 10 minutes
    });
  };

  // Get categories with counts
  const useCategories = () => {
    return useQuery({
      queryKey: ["article-categories"],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("articles")
          .select("category")
          .eq("status", "published")
          .not("category", "is", null);

        if (error) throw error;

        // Count categories
        const categoryCount: Record<string, number> = {};
        data.forEach((article) => {
          if (article.category) {
            categoryCount[article.category] = (categoryCount[article.category] || 0) + 1;
          }
        });

        return Object.entries(categoryCount).map(([name, count]) => ({ name, count }));
      },
      staleTime: 1000 * 60 * 15, // 15 minutes
    });
  };

  // Mutation for creating articles
  const createArticleMutation = useMutation({
    mutationFn: async (articleData: Partial<Article>) => {
      if (!user) throw new Error("Authentication required");

      const { data, error } = await supabase
        .from("articles")
        .insert({
          title: articleData.title || "Untitled",
          content: articleData.content || "",
          user_id: user.id,
          status: articleData.status || 'draft'
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles-archive"] });
      toast({
        title: "Success",
        description: "Article created successfully",
      });
    },
    onError: (error) => {
      handleError(error, { 
        title: "Creation Failed",
        action: "Creating article"
      });
    },
  });

  // Mutation for updating articles
  const updateArticleMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Article> }) => {
      const updateData: any = { ...updates };
      
      // Set published_at when publishing
      if (updates.status === 'published' && !updateData.published_at) {
        updateData.published_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("articles")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles-archive"] });
      queryClient.invalidateQueries({ queryKey: ["article"] });
      queryClient.invalidateQueries({ queryKey: ["article-slug"] });
      toast({
        title: "Success",
        description: "Article updated successfully",
      });
    },
    onError: (error) => {
      handleError(error, { 
        title: "Update Failed",
        action: "Updating article"
      });
    },
  });

  // Mutation for deleting articles
  const deleteArticleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles-archive"] });
      toast({
        title: "Success",
        description: "Article deleted successfully",
      });
    },
    onError: (error) => {
      handleError(error, { 
        title: "Deletion Failed",
        action: "Deleting article"
      });
    },
  });

  return {
    useArticles,
    useArticleArchive,
    useArticle,
    useArticleBySlug,
    useCategories,
    createArticle: createArticleMutation.mutate,
    updateArticle: updateArticleMutation.mutate,
    deleteArticle: deleteArticleMutation.mutate,
    isCreating: createArticleMutation.isPending,
    isUpdating: updateArticleMutation.isPending,
    isDeleting: deleteArticleMutation.isPending,
  };
}

// Hook for other unified data (partners, insights, etc.)
export function useUnifiedPartners() {
  return useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .eq("is_visible", true)
        .order("display_order");

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useUnifiedInsights() {
  return useQuery({
    queryKey: ["insights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insights")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}