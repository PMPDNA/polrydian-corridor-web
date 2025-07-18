-- Critical Security Fix: Add explicit search_path to all database functions
-- This prevents search_path injection attacks

-- Update assign_initial_admin function
CREATE OR REPLACE FUNCTION public.assign_initial_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

-- Update sync_linkedin_article_to_articles function
CREATE OR REPLACE FUNCTION public.sync_linkedin_article_to_articles(linkedin_article_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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