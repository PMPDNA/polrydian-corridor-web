-- Fix function search path security warning
-- Update all custom functions to have secure search_path

-- Fix log_integration_event function
CREATE OR REPLACE FUNCTION public.log_integration_event(p_integration_type text, p_operation text, p_status text DEFAULT 'pending'::text, p_user_id uuid DEFAULT NULL::uuid, p_error_message text DEFAULT NULL::text, p_error_code text DEFAULT NULL::text, p_request_data jsonb DEFAULT NULL::jsonb, p_response_data jsonb DEFAULT NULL::jsonb, p_execution_time_ms integer DEFAULT NULL::integer, p_retry_count integer DEFAULT 0)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  log_id UUID;
  client_ip INET;
  client_user_agent TEXT;
BEGIN
  -- Get client information
  client_ip := extract_first_ip(current_setting('request.headers', true)::jsonb ->> 'x-forwarded-for');
  client_user_agent := current_setting('request.headers', true)::jsonb ->> 'user-agent';
  
  -- Insert log entry
  INSERT INTO public.integration_logs (
    integration_type,
    operation,
    status,
    user_id,
    error_message,
    error_code,
    request_data,
    response_data,
    execution_time_ms,
    retry_count,
    ip_address,
    user_agent
  ) VALUES (
    p_integration_type,
    p_operation,
    p_status,
    COALESCE(p_user_id, auth.uid()),
    p_error_message,
    p_error_code,
    p_request_data,
    p_response_data,
    p_execution_time_ms,
    p_retry_count,
    client_ip,
    client_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

-- Fix sync_linkedin_article_to_articles function
CREATE OR REPLACE FUNCTION public.sync_linkedin_article_to_articles(linkedin_article_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_article_id UUID;
  linkedin_article RECORD;
BEGIN
  -- Get the LinkedIn article
  SELECT * INTO linkedin_article
  FROM public.linkedin_articles
  WHERE id = linkedin_article_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'LinkedIn article not found';
  END IF;
  
  -- Insert into articles table
  INSERT INTO public.articles (
    user_id,
    title,
    content,
    status,
    published_at
  ) VALUES (
    auth.uid(),
    linkedin_article.title,
    linkedin_article.content,
    'published',
    linkedin_article.published_at
  ) RETURNING id INTO new_article_id;
  
  -- Update LinkedIn article with migration info
  UPDATE public.linkedin_articles
  SET 
    is_migrated = true,
    migrated_article_id = new_article_id,
    updated_at = now()
  WHERE id = linkedin_article_id;
  
  RETURN new_article_id;
END;
$function$;

-- Fix other functions that may need search_path
CREATE OR REPLACE FUNCTION public.assign_admin_role(target_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check admin rate limiting first
  IF NOT check_admin_rate_limit('assign_admin_role', 3, 60) THEN
    RAISE EXCEPTION 'SECURITY_VIOLATION: Admin role assignment rate limit exceeded. Incident logged.';
  END IF;

  -- Only existing admins can assign admin roles
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can assign admin roles';
  END IF;
  
  -- Insert admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Log the admin assignment with enhanced details
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    details
  ) VALUES (
    auth.uid(),
    'admin_role_assigned',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'assigned_by', auth.uid(),
      'timestamp', now(),
      'severity', 'high'
    )
  );
  
  RETURN TRUE;
END;
$function$;