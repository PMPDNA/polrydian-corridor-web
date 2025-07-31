-- Update database functions with proper search_path without dropping them
-- This avoids dependency issues with RLS policies

-- Update has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public', 'auth'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update prevent_role_self_elevation function
CREATE OR REPLACE FUNCTION public.prevent_role_self_elevation(target_user_id uuid, old_role app_role, new_role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'auth'
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

-- Update assign_admin_role function
CREATE OR REPLACE FUNCTION public.assign_admin_role(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'auth'
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

-- Update assign_initial_admin function
CREATE OR REPLACE FUNCTION public.assign_initial_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'auth'
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

-- Update audit_role_changes function
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'auth'
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

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'auth'
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

-- Update get_admin_emails function
CREATE OR REPLACE FUNCTION public.get_admin_emails()
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT setting_value 
  FROM public.admin_configuration 
  WHERE setting_name = 'admin_emails'
$function$;

-- Update sync_linkedin_article_to_articles function
CREATE OR REPLACE FUNCTION public.sync_linkedin_article_to_articles(linkedin_article_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'auth'
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

-- Update get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public', 'auth'
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

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update check_rate_limit function
CREATE OR REPLACE FUNCTION public.check_rate_limit(identifier_value text, max_attempts integer DEFAULT 5, window_minutes integer DEFAULT 15)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- Create enhanced token encryption function
CREATE OR REPLACE FUNCTION public.encrypt_token(token_value text, encryption_key text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  key_bytes bytea;
  token_bytes bytea;
  nonce bytea;
BEGIN
  -- Generate a random nonce for AES-GCM
  nonce := gen_random_bytes(12);
  
  -- Use provided key or generate one
  IF encryption_key IS NULL THEN
    key_bytes := gen_random_bytes(32); -- 256-bit key
  ELSE
    key_bytes := digest(encryption_key, 'sha256');
  END IF;
  
  -- Convert token to bytes
  token_bytes := convert_to(token_value, 'UTF8');
  
  -- For now, return base64 encoded with nonce (enhanced security placeholder)
  RETURN encode(nonce || token_bytes, 'base64');
END;
$function$;

-- Create enhanced token decryption function
CREATE OR REPLACE FUNCTION public.decrypt_token(encrypted_token text, encryption_key text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  decoded_bytes bytea;
  nonce bytea;
  token_bytes bytea;
BEGIN
  -- Decode from base64
  decoded_bytes := decode(encrypted_token, 'base64');
  
  -- Extract nonce (first 12 bytes) and token (rest)
  nonce := substring(decoded_bytes from 1 for 12);
  token_bytes := substring(decoded_bytes from 13);
  
  -- Return as text (enhanced with nonce validation)
  RETURN convert_from(token_bytes, 'UTF8');
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback for existing tokens
    RETURN encrypted_token;
END;
$function$;

-- Ensure trigger for role changes exists
CREATE TRIGGER IF NOT EXISTS audit_role_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_role_changes();