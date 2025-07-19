-- Create secure admin configuration table
CREATE TABLE public.admin_configuration (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_name text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_configuration ENABLE ROW LEVEL SECURITY;

-- Only admins can manage admin configuration
CREATE POLICY "Admins can manage admin configuration" 
ON public.admin_configuration 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert initial admin emails into secure configuration
INSERT INTO public.admin_configuration (setting_name, setting_value)
VALUES ('admin_emails', '["patrick.misiewicz@polrydian.com", "polrydian@gmail.com"]'::jsonb);

-- Create secure function to get admin emails
CREATE OR REPLACE FUNCTION public.get_admin_emails()
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT setting_value 
  FROM public.admin_configuration 
  WHERE setting_name = 'admin_emails'
$$;

-- Update assign_initial_admin function to use secure configuration
CREATE OR REPLACE FUNCTION public.assign_initial_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Update handle_new_user function to use secure configuration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;

-- Add trigger for updating timestamps
CREATE TRIGGER update_admin_configuration_updated_at
BEFORE UPDATE ON public.admin_configuration
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();