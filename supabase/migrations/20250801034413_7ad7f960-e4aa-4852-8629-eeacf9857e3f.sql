-- Fix remaining database functions to use proper search_path
-- This addresses the Function Search Path Mutable warning

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

CREATE OR REPLACE FUNCTION public.assign_initial_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  admin_emails jsonb;
  current_user_email text;
BEGIN
  -- Check if this is the first user and if email matches expected admin
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin'::app_role) THEN
    -- Get admin emails from secure configuration
    admin_emails := get_admin_emails();
    
    -- Get current user's email
    SELECT email INTO current_user_email FROM auth.users WHERE id = auth.uid();
    
    -- Check if the current user's email is in the admin list
    IF admin_emails ? current_user_email THEN
      -- Assign admin role
      INSERT INTO public.user_roles (user_id, role)
      VALUES (auth.uid(), 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
      
      -- Log the admin assignment
      INSERT INTO public.security_audit_log (
        user_id,
        action,
        details
      ) VALUES (
        auth.uid(),
        'initial_admin_assigned',
        jsonb_build_object(
          'assigned_to', auth.uid(),
          'method', 'auto_assignment',
          'email', current_user_email
        )
      );
      
      RETURN TRUE;
    END IF;
  END IF;
  
  RETURN FALSE;
END;
$function$;

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

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  admin_emails jsonb;
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1))
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Get admin emails from secure configuration
  admin_emails := get_admin_emails();
  
  -- Check if this should be the initial admin
  IF admin_emails ? NEW.email 
     AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin'::app_role) THEN
    -- Assign admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Log the admin assignment
    INSERT INTO public.security_audit_log (
      user_id,
      action,
      details
    ) VALUES (
      NEW.id,
      'initial_admin_assigned',
      jsonb_build_object(
        'email', NEW.email,
        'method', 'signup_auto_assignment'
      )
    );
  END IF;
  
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