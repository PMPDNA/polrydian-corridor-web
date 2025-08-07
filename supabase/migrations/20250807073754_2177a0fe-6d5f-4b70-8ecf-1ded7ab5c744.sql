-- Emergency content restoration: Clean up corrupted Belarus article content
-- Step 1: Fix tripled characters and malformed HTML structure

-- Clean up all corrupted content patterns
UPDATE articles 
SET content = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(content,
          '([prs])\1{2,}', '\1', 'gi'  -- Fix tripled p, r, s characters (case insensitive)
        ),
        '<h2><br></h2>\s*', '', 'g'    -- Remove empty heading breaks
      ),
      '(<h[1-6][^>]*>)\s*\1', '\1', 'g'  -- Remove duplicate headings
    ),
    '<p></p>', '', 'g'  -- Remove empty paragraphs
  ),
  '\s+', ' ', 'g'  -- Normalize whitespace
)
WHERE content ~ '([prs])\1{2,}' OR content ~ '<h2><br></h2>' OR content ~ '<p></p>';

-- Step 2: Specific fixes for Belarus article
UPDATE articles 
SET content = REPLACE(
  REPLACE(
    REPLACE(
      REPLACE(content, 
        'Prpprppresident', 'President'
      ),
      'pppolitical', 'political'
    ),
    'rrrevolution', 'revolution'
  ),
  'sssoviet', 'soviet'
)
WHERE title ILIKE '%belarus%';

-- Step 3: Create a content cleaning function for future use
CREATE OR REPLACE FUNCTION clean_article_content(content_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
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

-- Step 4: Create trigger to prevent corrupted content from being saved
CREATE OR REPLACE FUNCTION prevent_content_corruption()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Clean the content before saving
  IF NEW.content IS NOT NULL THEN
    NEW.content := clean_article_content(NEW.content);
  END IF;
  
  -- Log suspicious patterns
  IF NEW.content ~ '([a-z])\1{3,}' THEN
    INSERT INTO integration_logs (
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

-- Create the trigger
DROP TRIGGER IF EXISTS clean_content_before_save ON articles;
CREATE TRIGGER clean_content_before_save
  BEFORE INSERT OR UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_content_corruption();