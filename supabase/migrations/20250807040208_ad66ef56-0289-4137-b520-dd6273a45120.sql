-- Additional cleanup for article content spacing and word breaks
UPDATE public.articles 
SET content = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(content, 
          '\s+', ' ', 'g'),  -- Normalize multiple spaces
        '>\s+<', '><', 'g'),  -- Remove spaces between tags  
      '(<\/p>)\s*(<p[^>]*>)', E'\\1\n\\2', 'g'),  -- Line breaks between paragraphs
    '(<\/h[1-6]>)\s*(<p[^>]*>)', E'\\1\n\\2', 'g'),  -- Line breaks after headings
  '(<p[^>]*>)\s*', E'\\1', 'g')  -- Remove leading spaces in paragraphs
WHERE content ~ '\s{2,}|>\s+<|(<\/[ph][1-6]?>)\s+(<[ph])';

-- Remove any remaining problematic spacing patterns
UPDATE public.articles 
SET content = REGEXP_REPLACE(
  REGEXP_REPLACE(content, 
    '([a-zA-Z])\s*\n\s*([a-zA-Z])', E'\\1 \\2', 'g'),  -- Fix broken words across lines
  '\s*<br\s*/?>\s*', ' ', 'g')  -- Convert br tags to spaces
WHERE content ~ '([a-zA-Z])\s*\n\s*([a-zA-Z])|<br\s*/?>';