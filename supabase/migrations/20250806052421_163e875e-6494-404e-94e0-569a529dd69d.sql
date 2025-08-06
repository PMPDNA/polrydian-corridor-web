-- Fix remaining functions with search path issues

-- Fix all remaining functions that need secure search_path
CREATE OR REPLACE FUNCTION public.check_admin_rate_limit(operation_type text, max_attempts integer DEFAULT 3, window_minutes integer DEFAULT 60)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  identifier_value text;
  current_record RECORD;
  window_start_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Create identifier based on user and operation type
  identifier_value := COALESCE(auth.uid()::text, 'anonymous') || '_' || operation_type;
  window_start_time := now() - (window_minutes || ' minutes')::INTERVAL;
  
  -- Get current rate limit record
  SELECT * INTO current_record
  FROM public.auth_rate_limits
  WHERE identifier = identifier_value
    AND window_start > window_start_time;
  
  -- Check if currently blocked
  IF current_record IS NOT NULL AND current_record.blocked_until IS NOT NULL 
     AND current_record.blocked_until > now() THEN
    -- Log security violation for admin operation abuse
    INSERT INTO public.security_audit_log (action, details, user_id)
    VALUES ('admin_rate_limit_violation', jsonb_build_object(
      'operation', operation_type,
      'blocked_until', current_record.blocked_until,
      'severity', 'high'
    ), auth.uid());
    
    RETURN FALSE;
  END IF;
  
  -- If no recent record, create new one
  IF current_record IS NULL THEN
    INSERT INTO public.auth_rate_limits (identifier, attempt_count, window_start)
    VALUES (identifier_value, 1, now());
    RETURN TRUE;
  END IF;
  
  -- If within rate limit, increment and allow
  IF current_record.attempt_count < max_attempts THEN
    UPDATE public.auth_rate_limits
    SET attempt_count = attempt_count + 1
    WHERE id = current_record.id;
    RETURN TRUE;
  END IF;
  
  -- Rate limit exceeded for admin operation
  UPDATE public.auth_rate_limits
  SET blocked_until = now() + (window_minutes * 2 || ' minutes')::INTERVAL,
      attempt_count = attempt_count + 1
  WHERE id = current_record.id;
  
  -- Log critical security event
  INSERT INTO public.security_audit_log (action, details, user_id)
  VALUES ('admin_operation_blocked', jsonb_build_object(
    'operation', operation_type,
    'attempt_count', current_record.attempt_count + 1,
    'blocked_until', now() + (window_minutes * 2 || ' minutes')::INTERVAL,
    'severity', 'critical'
  ), auth.uid());
  
  RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_rate_limit(identifier_value text, max_attempts integer DEFAULT 5, window_minutes integer DEFAULT 15)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_record RECORD;
  window_start_time TIMESTAMP WITH TIME ZONE;
  extended_block_time INTERVAL;
BEGIN
  window_start_time := now() - (window_minutes || ' minutes')::INTERVAL;
  
  -- Get current rate limit record
  SELECT * INTO current_record
  FROM public.auth_rate_limits
  WHERE identifier = identifier_value
    AND window_start > window_start_time;
  
  -- Check if currently blocked
  IF current_record IS NOT NULL AND current_record.blocked_until IS NOT NULL 
     AND current_record.blocked_until > now() THEN
    -- Extend block time for persistent violations
    extended_block_time := (window_minutes * 2) || ' minutes';
    UPDATE public.auth_rate_limits
    SET blocked_until = now() + extended_block_time
    WHERE id = current_record.id;
    
    -- Log security event
    INSERT INTO public.security_audit_log (action, details)
    VALUES ('rate_limit_violation_extended', jsonb_build_object(
      'identifier', identifier_value,
      'extended_block_until', now() + extended_block_time
    ));
    
    RETURN FALSE;
  END IF;
  
  -- If no recent record, create new one
  IF current_record IS NULL THEN
    INSERT INTO public.auth_rate_limits (identifier, attempt_count, window_start)
    VALUES (identifier_value, 1, now());
    RETURN TRUE;
  END IF;
  
  -- If within rate limit, increment and allow
  IF current_record.attempt_count < max_attempts THEN
    UPDATE public.auth_rate_limits
    SET attempt_count = attempt_count + 1
    WHERE id = current_record.id;
    RETURN TRUE;
  END IF;
  
  -- Rate limit exceeded - implement progressive blocking
  extended_block_time := CASE 
    WHEN current_record.attempt_count > max_attempts * 3 THEN (window_minutes * 4) || ' minutes'
    WHEN current_record.attempt_count > max_attempts * 2 THEN (window_minutes * 2) || ' minutes'
    ELSE window_minutes || ' minutes'
  END;
  
  UPDATE public.auth_rate_limits
  SET blocked_until = now() + extended_block_time::INTERVAL,
      attempt_count = attempt_count + 1
  WHERE id = current_record.id;
  
  -- Log security event
  INSERT INTO public.security_audit_log (action, details)
  VALUES ('rate_limit_exceeded', jsonb_build_object(
    'identifier', identifier_value,
    'attempt_count', current_record.attempt_count + 1,
    'blocked_until', now() + extended_block_time::INTERVAL
  ));
  
  RETURN FALSE;
END;
$function$;