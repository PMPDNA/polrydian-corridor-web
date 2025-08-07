-- Clean up corrupted article content (fix tripled characters and malformed structure)
UPDATE articles 
SET content = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      content,
      '([prs])\1{2,}', '\1', 'g'  -- Fix tripled p, r, s characters
    ),
    '<h2><br></h2>\s*', '', 'g'    -- Remove empty heading breaks
  ),
  '(<h[1-6][^>]*>)\s*\1', '\1', 'g'  -- Remove duplicate headings
)
WHERE content ~ '([prs])\1{2,}' OR content ~ '<h2><br></h2>' OR content ~ '(<h[1-6][^>]*>)\s*\1';

-- Fix specific Belarus article structure issues
UPDATE articles 
SET content = REPLACE(
  REPLACE(
    REPLACE(content, 
      '<h2>Belarusian Elections and Geopolitics</h2><h2><br></h2>', 
      '<h2>Belarusian Elections and Geopolitics</h2>'
    ),
    'prprpprprppresidential', 'presidential'
  ),
  'pppolitical', 'political'
)
WHERE title ILIKE '%belarus%';

-- Add paragraph breaks where missing after cleanup
UPDATE articles 
SET content = REGEXP_REPLACE(content, '(<\/h[1-6]>)(<p[^>]*>)', '\1\n\2', 'g')
WHERE content ~ '<\/h[1-6]><p[^>]*>';

-- Remove any duplicate Belarus articles (keep the most recent one)
DELETE FROM articles 
WHERE id IN (
  SELECT id 
  FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY title ORDER BY updated_at DESC) as rn
    FROM articles 
    WHERE title ILIKE '%belarus%'
  ) t 
  WHERE rn > 1
);