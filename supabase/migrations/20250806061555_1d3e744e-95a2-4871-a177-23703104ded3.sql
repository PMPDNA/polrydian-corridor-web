-- Fix search path security issues for newly created functions

-- Update generate_slug function with proper search path
CREATE OR REPLACE FUNCTION public.generate_slug(title_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(title_text, '[^a-zA-Z0-9\s\-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '\-+', '-', 'g'
    )
  );
END;
$$;

-- Update update_article_slug function with proper search path  
CREATE OR REPLACE FUNCTION public.update_article_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Generate slug from title if not provided
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = generate_slug(NEW.title);
    
    -- Ensure uniqueness by appending number if needed
    WHILE EXISTS (SELECT 1 FROM articles WHERE slug = NEW.slug AND id != NEW.id) LOOP
      NEW.slug = generate_slug(NEW.title) || '-' || floor(random() * 1000)::text;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;