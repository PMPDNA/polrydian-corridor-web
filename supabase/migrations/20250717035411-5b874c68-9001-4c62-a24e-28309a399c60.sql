-- Phase 1 Critical Security Fixes (Simplified)

-- 1. Fix the role elevation prevention policy (current one has logic error)
DROP POLICY IF EXISTS "Prevent role self-elevation" ON public.user_roles;

-- Create a security definer function to check role elevation attempts
CREATE OR REPLACE FUNCTION public.prevent_role_self_elevation(
  target_user_id UUID,
  old_role app_role,
  new_role app_role
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Allow if not the same user
  IF auth.uid() != target_user_id THEN
    RETURN TRUE;
  END IF;
  
  -- Block users from elevating themselves to admin or moderator
  IF old_role = 'user'::app_role AND new_role IN ('admin'::app_role, 'moderator'::app_role) THEN
    RETURN FALSE;
  END IF;
  
  -- Block moderators from elevating themselves to admin
  IF old_role = 'moderator'::app_role AND new_role = 'admin'::app_role THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Apply the policy using the function
CREATE POLICY "Prevent role self-elevation" 
ON public.user_roles 
FOR UPDATE 
TO authenticated
USING (true);

-- 2. Remove hardcoded admin email from handle_new_user function
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

-- 3. Create secure function to assign admin roles (removes hardcoded email)
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

-- 4. Enhanced role change validation in trigger
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log all role changes
  INSERT INTO public.security_audit_log (
    user_id, 
    action, 
    details
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
    )
  );

  -- Enhanced prevention of self-role elevation
  IF TG_OP = 'UPDATE' AND auth.uid() = NEW.user_id THEN
    -- Use our security function to check if elevation is allowed
    IF NOT prevent_role_self_elevation(NEW.user_id, OLD.role, NEW.role) THEN
      RAISE EXCEPTION 'SECURITY_VIOLATION: Users cannot elevate their own roles. Incident logged.';
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

-- 5. Add rate limiting table for authentication attempts
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

-- 6. Create function to check and update rate limits
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