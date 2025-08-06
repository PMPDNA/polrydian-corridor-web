-- Add category column to articles table for consistent schema
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS category text;

-- Update existing articles to use category from keywords array
UPDATE public.articles 
SET category = keywords[1] 
WHERE category IS NULL 
  AND keywords IS NOT NULL 
  AND array_length(keywords, 1) > 0;

-- Set default category for articles without any category
UPDATE public.articles 
SET category = 'Strategy' 
WHERE category IS NULL OR category = '';

-- Add a comment to document the standardization
COMMENT ON COLUMN public.articles.category IS 'Standardized category field - replaces reliance on keywords array';