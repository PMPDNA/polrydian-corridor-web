-- Enhanced privacy protection for visitor analytics

-- 1. Create a function to automatically anonymize old visitor data
CREATE OR REPLACE FUNCTION public.anonymize_old_visitor_data()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  anonymized_count integer := 0;
BEGIN
  -- Anonymize IP addresses older than 30 days for privacy compliance
  UPDATE public.visitor_analytics
  SET ip_address = NULL,
      city = 'Anonymized',
      country = 'Anonymized'
  WHERE created_at < (now() - interval '30 days')
    AND ip_address IS NOT NULL;
  
  GET DIAGNOSTICS anonymized_count = ROW_COUNT;
  
  -- Log the anonymization for audit trail
  IF anonymized_count > 0 THEN
    INSERT INTO public.security_audit_log (
      action,
      details
    ) VALUES (
      'visitor_data_anonymized',
      jsonb_build_object(
        'anonymized_records', anonymized_count,
        'retention_policy', '30_days_ip_anonymization',
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN anonymized_count;
END;
$$;

-- 2. Create a function for GDPR-compliant data cleanup
CREATE OR REPLACE FUNCTION public.cleanup_visitor_data_gdpr()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count integer := 0;
BEGIN
  -- Delete visitor data older than 2 years (GDPR compliance)
  DELETE FROM public.visitor_analytics
  WHERE created_at < (now() - interval '2 years');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log the cleanup
  IF deleted_count > 0 THEN
    INSERT INTO public.security_audit_log (
      action,
      details
    ) VALUES (
      'visitor_data_gdpr_cleanup',
      jsonb_build_object(
        'deleted_records', deleted_count,
        'retention_policy', '2_years_gdpr_compliance',
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN deleted_count;
END;
$$;

-- 3. Add a policy to prevent service role from accessing visitor analytics
-- (Extra security layer - only authenticated admin users should access)
CREATE POLICY "Block service role access to visitor analytics"
ON public.visitor_analytics
FOR ALL
TO service_role
USING (false);

-- 4. Create a view for aggregated analytics (non-sensitive)
CREATE OR REPLACE VIEW public.aggregated_visitor_stats AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_visits,
  COUNT(DISTINCT visitor_id) as unique_visitors,
  AVG(visit_duration) as avg_visit_duration,
  COUNT(DISTINCT country) as countries_count,
  COUNT(DISTINCT device_type) as device_types_count
FROM public.visitor_analytics
WHERE created_at >= (now() - interval '90 days')
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- 5. Grant admin access to the aggregated view
GRANT SELECT ON public.aggregated_visitor_stats TO authenticated;

-- 6. Create RLS policy for the aggregated view
ALTER VIEW public.aggregated_visitor_stats SET (security_invoker = true);

-- Add comment explaining the privacy measures
COMMENT ON TABLE public.visitor_analytics IS 'Visitor tracking data with automated privacy protection: IP addresses anonymized after 30 days, full records deleted after 2 years for GDPR compliance. Access restricted to admin users only.';

COMMENT ON FUNCTION public.anonymize_old_visitor_data() IS 'Anonymizes IP addresses and location data older than 30 days for privacy protection';

COMMENT ON FUNCTION public.cleanup_visitor_data_gdpr() IS 'Deletes visitor analytics data older than 2 years for GDPR compliance';

COMMENT ON VIEW public.aggregated_visitor_stats IS 'Privacy-safe aggregated visitor statistics without personally identifiable information';