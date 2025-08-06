-- Fix the remaining functions with search path issues
-- Focus on functions that might still be missing search_path

CREATE OR REPLACE FUNCTION public.rotate_expired_tokens()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  expired_count integer := 0;
BEGIN
  -- Mark expired tokens for rotation
  UPDATE public.social_media_credentials
  SET is_active = false,
      updated_at = now()
  WHERE expires_at < now()
    AND is_active = true;
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  -- Log token rotation event
  IF expired_count > 0 THEN
    INSERT INTO public.security_audit_log (action, details)
    VALUES ('token_rotation_completed', jsonb_build_object(
      'expired_tokens_count', expired_count,
      'timestamp', now(),
      'severity', 'medium'
    ));
  END IF;
  
  RETURN expired_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_password_reset_token(reset_token text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- In a real implementation, this would validate against a secure token store
  -- For now, we'll log the validation attempt
  INSERT INTO public.security_audit_log (action, details)
  VALUES ('password_reset_token_validation', jsonb_build_object(
    'token_length', length(reset_token),
    'timestamp', now(),
    'user_id', auth.uid()
  ));
  
  -- Basic validation - token should be at least 32 characters
  RETURN length(reset_token) >= 32;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(event_action text, event_details jsonb DEFAULT '{}'::jsonb, event_severity text DEFAULT 'medium'::text, client_ip text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  validated_ip inet;
  user_agent_info text;
BEGIN
  -- Validate and extract IP address
  IF client_ip IS NOT NULL THEN
    validated_ip := extract_first_ip(client_ip);
  END IF;
  
  -- Insert security audit log with enhanced details
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
    validated_ip,
    current_setting('request.headers', true)::jsonb ->> 'user-agent',
    now()
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_security_violation(violation_type text, details jsonb DEFAULT '{}'::jsonb, severity text DEFAULT 'high'::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Log security violations with enhanced details
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    details,
    ip_address,
    user_agent,
    created_at
  ) VALUES (
    auth.uid(),
    'security_violation_' || violation_type,
    jsonb_build_object(
      'severity', severity,
      'violation_type', violation_type,
      'timestamp', now(),
      'session_id', auth.jwt() ->> 'session_id',
      'details', details
    ),
    extract_first_ip(current_setting('request.headers', true)::jsonb ->> 'x-forwarded-for'),
    current_setting('request.headers', true)::jsonb ->> 'user-agent',
    now()
  );
  
  -- Alert for critical violations
  IF severity = 'critical' THEN
    -- This could trigger external alerting in production
    RAISE LOG 'CRITICAL SECURITY VIOLATION: % by user % at %', violation_type, auth.uid(), now();
  END IF;
END;
$function$;