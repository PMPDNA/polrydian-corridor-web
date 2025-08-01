-- Fix database function security by adding proper search_path constraints
-- This prevents search_path manipulation attacks

-- Update existing functions to use proper search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role FROM public.user_roles 
  WHERE user_id = auth.uid() 
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1 
      WHEN 'moderator' THEN 2 
      WHEN 'user' THEN 3 
    END 
  LIMIT 1
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.get_admin_emails()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT setting_value 
  FROM public.admin_configuration 
  WHERE setting_name = 'admin_emails'
$function$;

-- Add enhanced security audit logging function
CREATE OR REPLACE FUNCTION public.log_security_violation(
  violation_type text,
  details jsonb DEFAULT '{}'::jsonb,
  severity text DEFAULT 'high'::text
)
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