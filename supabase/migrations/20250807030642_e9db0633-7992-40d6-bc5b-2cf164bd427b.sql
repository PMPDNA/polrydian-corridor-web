-- Clean up malformed HTML in article content
UPDATE public.articles 
SET content = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(content, 
          'h([1-6])([A-Za-z])', 
          '<h\1>\2', 'g'),
        'p([A-Za-z])', 
        '<p>\1', 'g'),
      'strong([A-Za-z])', 
      '<strong>\1', 'g'),
    '</([a-z]+)>([A-Za-z])', 
    '</\1>\2', 'g'),
  '<span[^>]*style="[^"]*"[^>]*>([^<]*)</span>', 
  '\1', 'g')
WHERE content ~ '(h[1-6][A-Za-z]|p[A-Za-z]|strong[A-Za-z]|<span[^>]*style="[^"]*")';

-- Remove any remaining problematic span tags with inline styles
UPDATE public.articles 
SET content = REGEXP_REPLACE(content, '<span[^>]*>([^<]*)</span>', '\1', 'g')
WHERE content ~ '<span[^>]*>';