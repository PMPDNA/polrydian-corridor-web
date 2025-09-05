-- Fix security issues from the previous migration

-- Drop and recreate the view without SECURITY DEFINER (which was applied implicitly)
DROP VIEW IF EXISTS featured_articles;

-- Create a proper view that respects RLS policies
CREATE VIEW featured_articles 
WITH (security_invoker = true) AS
SELECT 
    id, title, content, category, featured_image, slug, 
    meta_description, published_at, created_at, reading_time_minutes,
    user_id, status
FROM articles 
WHERE status = 'published' 
    AND featured_image IS NOT NULL 
    AND featured_image != ''
ORDER BY published_at DESC;

-- Update the validation function to have proper search path
CREATE OR REPLACE FUNCTION validate_article_category()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.category IS NOT NULL AND NEW.category NOT IN (
        'geopolitics', 'strategy', 'ma', 'philosophy', 'deep_tech', 
        'defense', 'corridor_economics', 'supply_chain', 'market_analysis', 'general'
    ) THEN
        RAISE EXCEPTION 'Invalid category: %. Valid categories are: geopolitics, strategy, ma, philosophy, deep_tech, defense, corridor_economics, supply_chain, market_analysis, general', NEW.category;
    END IF;
    RETURN NEW;
END;
$$;