-- Fix the security definer view issue by removing SECURITY DEFINER
DROP VIEW IF EXISTS public.insights_latest;

CREATE VIEW public.insights_latest AS
SELECT DISTINCT ON (data_source, series_id)
  id, data_source, series_id, title, content, chart_config, 
  data_points, created_at, updated_at, indicator_type, is_published
FROM public.insights
WHERE is_published = true
ORDER BY data_source, series_id, created_at DESC;

-- Add RLS policy for the view access
CREATE POLICY IF NOT EXISTS "Public can view latest insights" 
ON public.insights 
FOR SELECT 
USING (is_published = true);