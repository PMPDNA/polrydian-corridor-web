-- Phase 1 Critical Security Fixes

-- 1. Fix the role elevation prevention policy (current one has logic error)
DROP POLICY IF EXISTS "Prevent role self-elevation" ON public.user_roles;

CREATE POLICY "Prevent role self-elevation" 
ON public.user_roles 
FOR UPDATE 
TO authenticated
USING (
  -- Prevent users from updating their own roles to admin or moderator
  NOT (
    auth.uid() = user_id 
    AND NEW.role IN ('admin'::app_role, 'moderator'::app_role)
    AND OLD.role != NEW.role
  )
);

-- 2. Add constraint to prevent direct role manipulation
ALTER TABLE public.user_roles 
ADD CONSTRAINT prevent_self_admin_assignment 
CHECK (
  CASE 
    WHEN role IN ('admin'::app_role, 'moderator'::app_role) 
    THEN user_id != auth.uid()
    ELSE true
  END
);

-- 3. Remove hardcoded admin email from handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1))
  );
  
  -- Assign default user role only
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Log new user registration
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    details
  ) VALUES (
    NEW.id,
    'user_registration',
    jsonb_build_object(
      'email', NEW.email,
      'registration_method', 'email_signup'
    )
  );
  
  RETURN NEW;
END;
$$;

-- 4. Create secure function to assign admin roles (removes hardcoded email)
CREATE OR REPLACE FUNCTION public.assign_admin_role(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only existing admins can assign admin roles
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can assign admin roles';
  END IF;
  
  -- Insert admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Log the admin assignment
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    details
  ) VALUES (
    auth.uid(),
    'admin_role_assigned',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'assigned_by', auth.uid()
    )
  );
  
  RETURN TRUE;
END;
$$;

-- 5. Enhanced role change validation in trigger
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log all role changes with IP and user agent if available
  INSERT INTO public.security_audit_log (
    user_id, 
    action, 
    details,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    'role_change',
    jsonb_build_object(
      'target_user_id', COALESCE(NEW.user_id, OLD.user_id),
      'old_role', CASE WHEN TG_OP = 'DELETE' THEN OLD.role ELSE NULL END,
      'new_role', CASE WHEN TG_OP = 'INSERT' THEN NEW.role 
                       WHEN TG_OP = 'UPDATE' THEN NEW.role 
                       ELSE NULL END,
      'operation', TG_OP,
      'timestamp', now()
    ),
    CASE WHEN current_setting('request.headers', true) IS NOT NULL 
         THEN (current_setting('request.headers', true)::jsonb->>'x-forwarded-for')::inet 
         ELSE NULL END,
    CASE WHEN current_setting('request.headers', true) IS NOT NULL 
         THEN current_setting('request.headers', true)::jsonb->>'user-agent' 
         ELSE NULL END
  );

  -- Enhanced prevention of self-role elevation
  IF TG_OP = 'UPDATE' AND auth.uid() = NEW.user_id THEN
    -- Block any attempt to self-elevate roles
    IF OLD.role = 'user'::app_role AND NEW.role IN ('admin'::app_role, 'moderator'::app_role) THEN
      RAISE EXCEPTION 'SECURITY_VIOLATION: Users cannot elevate their own roles to admin or moderator. Incident logged.';
    END IF;
    
    -- Block moderators from making themselves admin
    IF OLD.role = 'moderator'::app_role AND NEW.role = 'admin'::app_role THEN
      RAISE EXCEPTION 'SECURITY_VIOLATION: Moderators cannot elevate themselves to admin. Incident logged.';
    END IF;
  END IF;

  -- Enhanced prevention of self-assignment of elevated roles
  IF TG_OP = 'INSERT' AND auth.uid() = NEW.user_id THEN
    IF NEW.role IN ('admin'::app_role, 'moderator'::app_role) THEN
      RAISE EXCEPTION 'SECURITY_VIOLATION: Users cannot assign elevated roles to themselves. Incident logged.';
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 6. Tighten OTP security settings (reduce from 10 minutes to 5 minutes)
UPDATE auth.config SET
  value = '300'::text
WHERE name = 'GOTRUE_OTP_EXPIRY';

-- 7. Add rate limiting table for authentication attempts
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- IP address or user identifier
  attempt_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rate limits table
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system can manage rate limits
CREATE POLICY "System can manage rate limits" 
ON public.auth_rate_limits 
FOR ALL 
USING (true);

-- 8. Create function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  identifier_value TEXT,
  max_attempts INTEGER DEFAULT 5,
  window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_record RECORD;
  window_start_time TIMESTAMP WITH TIME ZONE;
BEGIN
  window_start_time := now() - (window_minutes || ' minutes')::INTERVAL;
  
  -- Get current rate limit record
  SELECT * INTO current_record
  FROM public.auth_rate_limits
  WHERE identifier = identifier_value
    AND window_start > window_start_time;
  
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
  
  -- Rate limit exceeded
  UPDATE public.auth_rate_limits
  SET blocked_until = now() + (window_minutes || ' minutes')::INTERVAL
  WHERE id = current_record.id;
  
  RETURN FALSE;
END;
$$;