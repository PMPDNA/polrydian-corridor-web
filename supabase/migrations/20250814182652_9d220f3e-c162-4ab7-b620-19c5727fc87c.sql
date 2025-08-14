-- Fix remaining security warnings

-- 1. Fix function search path by setting it explicitly
CREATE OR REPLACE FUNCTION get_latest_insights()
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  data_source text,
  series_id text,
  indicator_type text,
  region text,
  data_points jsonb,
  chart_config jsonb,
  is_published boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'  -- Fix the search path warning
AS $$
  SELECT DISTINCT ON (data_source, series_id) 
    i.id, i.title, i.content, i.data_source, i.series_id, 
    i.indicator_type, i.region, i.data_points, i.chart_config,
    i.is_published, i.created_at, i.updated_at
  FROM insights i
  WHERE i.is_published = true
  ORDER BY data_source, series_id, created_at DESC;
$$;