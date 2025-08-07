-- Fix security warnings by setting proper search_path for newly created functions

-- Update the clean_article_content function with proper security settings
CREATE OR REPLACE FUNCTION clean_article_content(content_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Remove tripled characters
  content_text := REGEXP_REPLACE(content_text, '([a-z])\1{2,}', '\1', 'gi');
  
  -- Remove empty HTML elements
  content_text := REGEXP_REPLACE(content_text, '<(p|h[1-6]|div)></\1>', '', 'g');
  content_text := REGEXP_REPLACE(content_text, '<(p|h[1-6]|div)[^>]*><br></\1>', '', 'g');
  
  -- Normalize whitespace
  content_text := REGEXP_REPLACE(content_text, '\s+', ' ', 'g');
  content_text := TRIM(content_text);
  
  RETURN content_text;
END;
$$;

-- Update the trigger function with proper security settings
CREATE OR REPLACE FUNCTION prevent_content_corruption()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Clean the content before saving
  IF NEW.content IS NOT NULL THEN
    NEW.content := clean_article_content(NEW.content);
  END IF;
  
  -- Log suspicious patterns
  IF NEW.content ~ '([a-z])\1{3,}' THEN
    INSERT INTO public.integration_logs (
      integration_type, 
      operation, 
      status, 
      error_message,
      request_data
    ) VALUES (
      'content_validation',
      'corruption_detected',
      'warning',
      'Potential content corruption detected and cleaned',
      jsonb_build_object(
        'article_id', NEW.id,
        'title', NEW.title,
        'corruption_pattern', 'repeated_characters'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;