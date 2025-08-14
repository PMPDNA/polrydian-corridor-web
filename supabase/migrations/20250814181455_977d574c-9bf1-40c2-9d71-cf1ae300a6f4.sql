-- Security hardening: Tighten RLS policies for PII protection

-- First, update FRED data to use proper upsert constraints  
CREATE UNIQUE INDEX IF NOT EXISTS idx_insights_unique_observation 
ON insights (data_source, series_id, 
  COALESCE((data_points->-1->>'date')::text, created_at::date::text));

-- Restrict consultation_bookings to admin-only reads
DROP POLICY IF EXISTS "Admins can manage all consultation bookings" ON consultation_bookings;
DROP POLICY IF EXISTS "Anyone can create consultation bookings" ON consultation_bookings;

CREATE POLICY "Public can submit consultation requests"
ON consultation_bookings FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view all bookings"  
ON consultation_bookings FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update booking status"
ON consultation_bookings FOR UPDATE  
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Restrict newsletter_subscriptions 
DROP POLICY IF EXISTS "Admins can manage newsletter subscriptions" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscriptions;

CREATE POLICY "Public can subscribe"
ON newsletter_subscriptions FOR INSERT
TO anon, authenticated  
WITH CHECK (true);

CREATE POLICY "Admins can manage subscriptions"
ON newsletter_subscriptions FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Restrict GDPR deletion requests
DROP POLICY IF EXISTS "Admins can manage deletion requests" ON gdpr_deletion_requests;
DROP POLICY IF EXISTS "Anyone can create deletion requests" ON gdpr_deletion_requests;

CREATE POLICY "Public can request data deletion"
ON gdpr_deletion_requests FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can manage deletion requests"
ON gdpr_deletion_requests FOR ALL  
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Restrict article_submissions
DROP POLICY IF EXISTS "Admins can manage all submissions" ON article_submissions;
DROP POLICY IF EXISTS "Public can submit articles" ON article_submissions;

CREATE POLICY "Public can submit articles"
ON article_submissions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can manage submissions"
ON article_submissions FOR ALL
TO authenticated  
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Secure performance metrics - remove public read access
DROP POLICY IF EXISTS "Admins can view performance metrics" ON performance_metrics;
DROP POLICY IF EXISTS "Allow anonymous performance metrics" ON performance_metrics;

CREATE POLICY "System can insert performance metrics"
ON performance_metrics FOR INSERT
TO anon, authenticated, service_role
WITH CHECK (true);

CREATE POLICY "Admins can view performance metrics"
ON performance_metrics FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add data retention policy for performance metrics
CREATE OR REPLACE FUNCTION cleanup_old_performance_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $$
BEGIN
  -- Delete performance metrics older than 30 days
  DELETE FROM public.performance_metrics 
  WHERE created_at < now() - interval '30 days';
  
  -- Delete system health checks older than 7 days
  DELETE FROM public.system_health_checks 
  WHERE created_at < now() - interval '7 days';
END;
$$;