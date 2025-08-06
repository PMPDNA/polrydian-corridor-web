-- Generate slugs for existing articles that don't have them
UPDATE articles 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(title, '[^a-zA-Z0-9\s\-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '\-+', '-', 'g'
  )
)
WHERE slug IS NULL OR slug = '';

-- Ensure all slugs are unique by appending timestamp if needed
WITH duplicate_slugs AS (
  SELECT slug, COUNT(*) as count
  FROM articles 
  WHERE slug IS NOT NULL AND slug != ''
  GROUP BY slug
  HAVING COUNT(*) > 1
)
UPDATE articles 
SET slug = articles.slug || '-' || EXTRACT(EPOCH FROM articles.created_at)::text
WHERE slug IN (SELECT slug FROM duplicate_slugs)
AND id NOT IN (
  SELECT DISTINCT ON (slug) id 
  FROM articles 
  WHERE slug IN (SELECT slug FROM duplicate_slugs)
  ORDER BY slug, created_at ASC
);