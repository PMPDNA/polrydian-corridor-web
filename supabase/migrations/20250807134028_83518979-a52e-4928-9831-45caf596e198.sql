-- Fix the article saving issue by improving the content cleaning function
-- and ensuring it works correctly with the trigger

-- First, create a comprehensive content cleaning function
CREATE OR REPLACE FUNCTION clean_article_content(content_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Step 1: Fix specific corrupted patterns first
  content_text := REGEXP_REPLACE(content_text, 'prpprpprotests', 'protests', 'gi');
  content_text := REGEXP_REPLACE(content_text, 'prpprppresident', 'president', 'gi');
  content_text := REGEXP_REPLACE(content_text, 'vmmassal', 'vassal', 'gi');
  
  -- Step 2: Remove tripled characters more aggressively
  content_text := REGEXP_REPLACE(content_text, '([a-z])\1{2,}', '\1', 'gi');
  
  -- Step 3: Fix doubled characters that shouldn't be doubled
  content_text := REGEXP_REPLACE(content_text, '([bcdfghjklmnpqrstvwxz])\1(?![aeiou])', '\1', 'gi');
  
  -- Step 4: Remove empty HTML elements
  content_text := REGEXP_REPLACE(content_text, '<(p|h[1-6]|div)>\s*</\1>', '', 'g');
  content_text := REGEXP_REPLACE(content_text, '<(p|h[1-6]|div)[^>]*>\s*<br\s*/?>\s*</\1>', '', 'g');
  
  -- Step 5: Normalize whitespace
  content_text := REGEXP_REPLACE(content_text, '\s+', ' ', 'g');
  content_text := TRIM(content_text);
  
  RETURN content_text;
END;
$$;

-- Update the trigger function to only clean if content actually needs cleaning
CREATE OR REPLACE FUNCTION prevent_content_corruption()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only clean content if it contains corruption patterns
  IF NEW.content IS NOT NULL AND (
    NEW.content ~ '([a-z])\1{2,}' OR
    NEW.content ~ 'prpprpp|vmm|sss|rrr|ppp'
  ) THEN
    NEW.content := clean_article_content(NEW.content);
    
    -- Log the cleaning action
    INSERT INTO public.integration_logs (
      integration_type, 
      operation, 
      status, 
      error_message,
      request_data
    ) VALUES (
      'content_validation',
      'corruption_cleaned',
      'success',
      'Content corruption detected and cleaned during save',
      jsonb_build_object(
        'article_id', NEW.id,
        'title', NEW.title
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix the existing corrupted Belarus article
UPDATE articles 
SET content = clean_article_content(content)
WHERE title ILIKE '%belarus%' AND content ~ '([a-z])\1{2,}';

-- Log the fix
INSERT INTO public.integration_logs (
  integration_type, 
  operation, 
  status, 
  error_message
) VALUES (
  'content_repair',
  'belarus_article_fixed',
  'success',
  'Fixed corrupted content in Belarus article'
);