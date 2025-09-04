-- Add critical database indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_articles_status_published ON public.articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_series_created ON public.insights(series_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_media_credentials_user_expires ON public.social_media_credentials(user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_status ON public.consultation_bookings(status);
CREATE INDEX IF NOT EXISTS idx_integration_logs_type_created ON public.integration_logs(integration_type, created_at DESC);

-- Add rate limiting function for edge functions
CREATE OR REPLACE FUNCTION public.check_edge_function_rate_limit(
  function_name text,
  max_requests integer DEFAULT 60,
  window_minutes integer DEFAULT 1
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  identifier_key text;
  client_ip text;
BEGIN
  -- Create rate limit identifier
  client_ip := current_setting('request.headers', true)::jsonb ->> 'x-forwarded-for';
  identifier_key := function_name || '_' || COALESCE(client_ip, 'unknown_ip');
  
  -- Use existing rate limit function
  RETURN check_rate_limit(identifier_key, max_requests, window_minutes);
END;
$$;