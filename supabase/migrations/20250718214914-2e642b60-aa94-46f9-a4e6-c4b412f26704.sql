-- Create a function to make the first user with specific email an admin
CREATE OR REPLACE FUNCTION public.assign_initial_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if this is the first user and if email matches expected admin
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin'::app_role) THEN
    -- Check if the current user is one of the expected admin emails
    IF EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND email IN ('patrick.misiewicz@polrydian.com', 'polrydian@gmail.com')
    ) THEN
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
          'method', 'auto_assignment'
        )
      );
      
      RETURN TRUE;
    END IF;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Update the trigger to also check for initial admin assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
  
  -- Check if this should be the initial admin
  IF NEW.email IN ('patrick.misiewicz@polrydian.com', 'polrydian@gmail.com') 
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