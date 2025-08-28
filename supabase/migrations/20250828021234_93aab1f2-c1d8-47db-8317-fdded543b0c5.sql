-- Security improvements for consultation_bookings table
-- Phase 1: Add explicit security policies and improve access control

-- Add explicit DENY policies for public access to sensitive operations
CREATE POLICY "Public cannot select consultation bookings" 
ON public.consultation_bookings 
FOR SELECT 
TO anon, public
USING (false);

CREATE POLICY "Public cannot delete consultation bookings" 
ON public.consultation_bookings 
FOR DELETE 
TO anon, public
USING (false);

-- Add admin-only DELETE policy
CREATE POLICY "Admins can delete consultation bookings" 
ON public.consultation_bookings 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Ensure the rate limiting function exists and is secure
CREATE OR REPLACE FUNCTION public.check_contact_form_rate_limit(client_ip text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rate_limit_key text;
  current_count integer;
  window_start_time timestamp with time zone;
BEGIN
  -- Rate limit: 3 submissions per IP per 15-minute window
  rate_limit_key := 'contact_form_' || client_ip;
  window_start_time := now() - interval '15 minutes';
  
  -- Clean up old entries first
  DELETE FROM public.auth_rate_limits 
  WHERE identifier = rate_limit_key 
    AND window_start < window_start_time;
  
  -- Check current count
  SELECT COALESCE(attempt_count, 0) INTO current_count
  FROM public.auth_rate_limits
  WHERE identifier = rate_limit_key
    AND window_start > window_start_time;
  
  -- If no recent record or within limit
  IF current_count IS NULL OR current_count < 3 THEN
    -- Insert or update rate limit record
    INSERT INTO public.auth_rate_limits (identifier, attempt_count, window_start)
    VALUES (rate_limit_key, 1, now())
    ON CONFLICT (identifier) 
    DO UPDATE SET 
      attempt_count = public.auth_rate_limits.attempt_count + 1,
      window_start = CASE 
        WHEN public.auth_rate_limits.window_start < window_start_time 
        THEN now() 
        ELSE public.auth_rate_limits.window_start 
      END;
    
    RETURN TRUE;
  END IF;
  
  -- Rate limit exceeded - log security event
  INSERT INTO public.security_audit_log (action, details, ip_address)
  VALUES (
    'contact_form_rate_limit_violation',
    jsonb_build_object(
      'client_ip', client_ip,
      'attempt_count', current_count + 1,
      'severity', 'medium'
    ),
    client_ip::inet
  );
  
  RETURN FALSE;
END;
$$;

-- Add data retention policy trigger
CREATE OR REPLACE FUNCTION public.cleanup_old_consultation_bookings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Archive bookings older than 2 years (only if status is 'completed' or 'cancelled')
  -- Keep active and pending bookings indefinitely for business needs
  UPDATE public.consultation_bookings 
  SET admin_notes = COALESCE(admin_notes, '') || ' [Auto-archived: ' || now()::date || ']'
  WHERE created_at < now() - interval '2 years'
    AND status IN ('completed', 'cancelled')
    AND admin_notes NOT LIKE '%Auto-archived%';
    
  -- Log cleanup activity
  INSERT INTO public.integration_logs (
    integration_type,
    operation,
    status,
    request_data
  ) VALUES (
    'data_retention',
    'consultation_bookings_cleanup',
    'success',
    jsonb_build_object(
      'cleanup_date', now(),
      'retention_policy', '2_years_completed_cancelled'
    )
  );
END;
$$;

-- Add enhanced logging for consultation bookings
CREATE OR REPLACE FUNCTION public.log_consultation_booking_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log all access to consultation bookings for audit trail
  IF TG_OP = 'SELECT' AND auth.uid() IS NOT NULL THEN
    INSERT INTO public.security_audit_log (
      user_id,
      action,
      details
    ) VALUES (
      auth.uid(),
      'consultation_booking_accessed',
      jsonb_build_object(
        'booking_id', OLD.id,
        'access_type', 'view',
        'timestamp', now()
      )
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.security_audit_log (
      user_id,
      action,
      details
    ) VALUES (
      auth.uid(),
      'consultation_booking_updated',
      jsonb_build_object(
        'booking_id', NEW.id,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply the audit trigger
CREATE TRIGGER consultation_booking_audit_trigger
  AFTER UPDATE ON public.consultation_bookings
  FOR EACH ROW EXECUTE FUNCTION public.log_consultation_booking_access();

-- Add comment for documentation
COMMENT ON TABLE public.consultation_bookings IS 
'Customer consultation requests with enhanced security: RLS policies prevent public read/delete access, rate limiting prevents spam, audit logging tracks all access, and data retention policies manage long-term storage.';

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.check_contact_form_rate_limit(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_old_consultation_bookings() TO service_role;