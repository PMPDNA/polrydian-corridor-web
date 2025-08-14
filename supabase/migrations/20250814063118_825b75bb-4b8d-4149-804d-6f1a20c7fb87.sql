-- Keep only one row per (source, series_id, observed_at)
CREATE UNIQUE INDEX IF NOT EXISTS insights_unique_idx
ON public.insights (data_source, series_id, created_at)
WHERE created_at IS NOT NULL;

-- Remove existing duplicates, keep the newest
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY data_source, series_id, DATE(created_at)
           ORDER BY created_at DESC
         ) as rn
  FROM public.insights
  WHERE created_at IS NOT NULL
)
DELETE FROM public.insights t
USING ranked r
WHERE t.id = r.id AND r.rn > 1;

-- Handy view for UI: always get the latest per series
CREATE OR REPLACE VIEW public.insights_latest AS
SELECT DISTINCT ON (data_source, series_id)
  id, data_source, series_id, title, content, chart_config, 
  data_points, created_at, updated_at, indicator_type, is_published
FROM public.insights
WHERE is_published = true
ORDER BY data_source, series_id, created_at DESC;