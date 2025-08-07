-- Clean existing corrupted article content
UPDATE articles 
SET content = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(content, 'prpprpprotests', 'protests', 'gi'),
    'prpprppresident', 'president', 'gi'
  ),
  '([a-z])\1{2,}', '\1', 'gi'
)
WHERE content ~ '([a-z])\1{3,}|prpprpprotests|prpprppresident';

-- Fix specific corrupted articles
UPDATE articles 
SET content = clean_article_content(content)
WHERE content ~ '([a-z])\1{3,}' OR content LIKE '%prpprp%';