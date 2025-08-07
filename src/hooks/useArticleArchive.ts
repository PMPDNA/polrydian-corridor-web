import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ArticleArchiveParams = {
  page: number;
  pageSize: number;
  category?: string;
  search?: string;
  sort?: "newest" | "oldest";
};

export function useArticleArchive({ page, pageSize, category, search, sort = "newest" }: ArticleArchiveParams) {
  return useQuery({
    queryKey: ["articles-archive", { page, pageSize, category, search, sort }],
    queryFn: async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("articles")
        .select("*", { count: "exact" })
        .eq("status", "published");

      if (category) query = query.eq("category", category);
      if (search && search.trim()) {
        // Search in title and content
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }

      query = query.order("published_at", { ascending: sort === "oldest" }).order("created_at", { ascending: sort === "oldest" });

      const { data, error, count } = await query.range(from, to);
      if (error) throw error;

      return { items: data || [], total: count || 0 };
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  });
}
