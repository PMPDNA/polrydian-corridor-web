-- Security Fix: Add explicit search_path to all database functions

-- Update prevent_role_self_elevation function to include explicit search_path
CREATE OR REPLACE FUNCTION public.prevent_role_self_elevation(target_user_id uuid, old_role app_role, new_role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- Update handle_new_user function with explicit search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- Update assign_admin_role function with explicit search_path
CREATE OR REPLACE FUNCTION public.assign_admin_role(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- Update audit_role_changes function with explicit search_path
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- Update has_role function with explicit search_path
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

-- Update get_current_user_role function with explicit search_path
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

-- Update update_updated_at_column function with explicit search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update check_rate_limit function with explicit search_path
CREATE OR REPLACE FUNCTION public.check_rate_limit(identifier_value text, max_attempts integer DEFAULT 5, window_minutes integer DEFAULT 15)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;