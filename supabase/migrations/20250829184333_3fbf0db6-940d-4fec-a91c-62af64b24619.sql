-- Phase 1: Performance Indexes for Better Query Performance
CREATE INDEX IF NOT EXISTS idx_articles_published 
ON public.articles(published_at DESC, status) 
WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_articles_user_status 
ON public.articles(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_insights_date_published 
ON public.insights(created_at DESC, is_published) 
WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_insights_data_source 
ON public.insights(data_source, series_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_action 
ON public.security_audit_log(user_id, action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp 
ON public.security_audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_status_date 
ON public.consultation_bookings(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_email 
ON public.consultation_bookings(email, created_at DESC);

-- Rate limiting optimization
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup 
ON public.auth_rate_limits(identifier, window_start DESC);

CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked 
ON public.auth_rate_limits(blocked_until) 
WHERE blocked_until IS NOT NULL;

-- Integration logs for monitoring
CREATE INDEX IF NOT EXISTS idx_integration_logs_type_status 
ON public.integration_logs(integration_type, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_integration_logs_error 
ON public.integration_logs(created_at DESC) 
WHERE status = 'error';

-- Phase 2: Enhanced Security Functions
CREATE OR REPLACE FUNCTION public.check_user_role_secure(target_user_id uuid, required_role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if target user has the required role
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = target_user_id 
    AND role = required_role
  );
END;
$$;

-- Enhanced rate limiting with configurable windows
CREATE OR REPLACE FUNCTION public.enhanced_rate_limit_check(
  identifier_key text, 
  action_type text, 
  max_requests integer DEFAULT 5, 
  window_minutes integer DEFAULT 15
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  full_identifier text;
  current_record RECORD;
  window_start_time TIMESTAMP WITH TIME ZONE;
  result jsonb;
BEGIN
  full_identifier := identifier_key || '_' || action_type;
  window_start_time := now() - (window_minutes || ' minutes')::INTERVAL;
  
  -- Get current rate limit record
  SELECT * INTO current_record
  FROM public.auth_rate_limits
  WHERE identifier = full_identifier
    AND window_start > window_start_time;
  
  -- Check if currently blocked
  IF current_record IS NOT NULL AND current_record.blocked_until > now() THEN
    result := jsonb_build_object(
      'allowed', false,
      'blocked_until', current_record.blocked_until,
      'attempts_remaining', 0,
      'window_reset', current_record.window_start + (window_minutes || ' minutes')::INTERVAL
    );
    RETURN result;
  END IF;
  
  -- If no recent record, create new one
  IF current_record IS NULL THEN
    INSERT INTO public.auth_rate_limits (identifier, attempt_count, window_start)
    VALUES (full_identifier, 1, now());
    
    result := jsonb_build_object(
      'allowed', true,
      'attempts_remaining', max_requests - 1,
      'window_reset', now() + (window_minutes || ' minutes')::INTERVAL
    );
    RETURN result;
  END IF;
  
  -- If within rate limit, increment and allow
  IF current_record.attempt_count < max_requests THEN
    UPDATE public.auth_rate_limits
    SET attempt_count = attempt_count + 1
    WHERE id = current_record.id;
    
    result := jsonb_build_object(
      'allowed', true,
      'attempts_remaining', max_requests - current_record.attempt_count - 1,
      'window_reset', current_record.window_start + (window_minutes || ' minutes')::INTERVAL
    );
    RETURN result;
  END IF;
  
  -- Rate limit exceeded
  UPDATE public.auth_rate_limits
  SET blocked_until = now() + (window_minutes || ' minutes')::INTERVAL,
      attempt_count = attempt_count + 1
  WHERE id = current_record.id;
  
  -- Log security event
  INSERT INTO public.security_audit_log (action, details)
  VALUES ('enhanced_rate_limit_exceeded', jsonb_build_object(
    'identifier', full_identifier,
    'action_type', action_type,
    'attempt_count', current_record.attempt_count + 1,
    'blocked_until', now() + (window_minutes || ' minutes')::INTERVAL
  ));
  
  result := jsonb_build_object(
    'allowed', false,
    'blocked_until', now() + (window_minutes || ' minutes')::INTERVAL,
    'attempts_remaining', 0,
    'window_reset', current_record.window_start + (window_minutes || ' minutes')::INTERVAL
  );
  
  RETURN result;
END;
$$;

-- Comprehensive audit logging function
CREATE OR REPLACE FUNCTION public.audit_log_event(
  event_action text, 
  event_details jsonb DEFAULT '{}'::jsonb, 
  event_severity text DEFAULT 'medium'::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  log_id uuid;
  client_ip inet;
BEGIN
  -- Extract client IP safely
  client_ip := extract_first_ip(current_setting('request.headers', true)::jsonb ->> 'x-forwarded-for');
  
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    details,
    ip_address,
    user_agent,
    created_at
  ) VALUES (
    auth.uid(),
    event_action,
    jsonb_build_object(
      'severity', event_severity,
      'timestamp', now(),
      'session_id', auth.jwt() ->> 'session_id',
      'details', event_details
    ),
    client_ip,
    current_setting('request.headers', true)::jsonb ->> 'user-agent',
    now()
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- System health check function
CREATE OR REPLACE FUNCTION public.system_health_check()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  health_status jsonb;
  db_stats jsonb;
  recent_errors integer;
  active_sessions integer;
BEGIN
  -- Get database statistics
  SELECT jsonb_build_object(
    'total_articles', (SELECT COUNT(*) FROM public.articles),
    'published_articles', (SELECT COUNT(*) FROM public.articles WHERE status = 'published'),
    'total_users', (SELECT COUNT(*) FROM public.user_roles),
    'admin_users', (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin'),
    'recent_bookings', (SELECT COUNT(*) FROM public.consultation_bookings WHERE created_at > now() - interval '24 hours'),
    'integration_logs_today', (SELECT COUNT(*) FROM public.integration_logs WHERE created_at > now() - interval '24 hours')
  ) INTO db_stats;
  
  -- Get recent error count
  SELECT COUNT(*) INTO recent_errors
  FROM public.integration_logs 
  WHERE status = 'error' 
    AND created_at > now() - interval '1 hour';
  
  -- Get active rate limited sessions
  SELECT COUNT(*) INTO active_sessions
  FROM public.auth_rate_limits 
  WHERE blocked_until > now();
  
  health_status := jsonb_build_object(
    'status', CASE 
      WHEN recent_errors > 10 THEN 'critical'
      WHEN recent_errors > 5 THEN 'warning'
      ELSE 'healthy'
    END,
    'timestamp', now(),
    'database', db_stats,
    'recent_errors', recent_errors,
    'active_rate_limits', active_sessions,
    'uptime_check', 'ok'
  );
  
  RETURN health_status;
END;
$$;