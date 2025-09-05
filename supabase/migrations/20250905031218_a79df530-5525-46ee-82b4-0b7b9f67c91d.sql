-- Delete all placeholder/demo articles
DELETE FROM public.articles 
WHERE title LIKE '%Lorem%' 
   OR title LIKE '%Placeholder%' 
   OR title LIKE '%Demo%' 
   OR title LIKE '%Sample%' 
   OR title LIKE '%Test%' 
   OR content LIKE '%Lorem ipsum%' 
   OR content LIKE '%placeholder%' 
   OR content LIKE '%demo content%'
   OR content LIKE '%sample article%';

-- Also delete any articles that might be empty or have minimal content
DELETE FROM public.articles 
WHERE LENGTH(TRIM(content)) < 100;