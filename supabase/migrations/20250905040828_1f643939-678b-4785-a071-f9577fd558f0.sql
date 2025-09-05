-- Update articles table to ensure we have proper category support with the requested categories
-- First, let's add a check to see what categories exist and update them

-- Add categories enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'article_category') THEN
        CREATE TYPE article_category AS ENUM (
            'geopolitics', 
            'strategy', 
            'ma', 
            'philosophy', 
            'deep_tech', 
            'defense',
            'corridor_economics',
            'supply_chain',
            'market_analysis',
            'general'
        );
    END IF;
END $$;

-- Update the articles table to use the enum if it's not already
-- But since we can't easily change existing text columns to enum without data migration,
-- we'll ensure the category column accepts these values and create a validation function

-- Create a function to validate article categories
CREATE OR REPLACE FUNCTION validate_article_category()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.category IS NOT NULL AND NEW.category NOT IN (
        'geopolitics', 'strategy', 'ma', 'philosophy', 'deep_tech', 
        'defense', 'corridor_economics', 'supply_chain', 'market_analysis', 'general'
    ) THEN
        RAISE EXCEPTION 'Invalid category: %. Valid categories are: geopolitics, strategy, ma, philosophy, deep_tech, defense, corridor_economics, supply_chain, market_analysis, general', NEW.category;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate categories
DROP TRIGGER IF EXISTS validate_article_category_trigger ON articles;
CREATE TRIGGER validate_article_category_trigger
    BEFORE INSERT OR UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION validate_article_category();

-- Add an index on category for better performance
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_featured_image ON articles(featured_image);
CREATE INDEX IF NOT EXISTS idx_articles_status_published_at ON articles(status, published_at DESC) WHERE status = 'published';

-- Create a view for featured articles (articles with featured images and published status)
CREATE OR REPLACE VIEW featured_articles AS
SELECT 
    id, title, content, category, featured_image, slug, 
    meta_description, published_at, created_at, reading_time_minutes,
    user_id, status
FROM articles 
WHERE status = 'published' 
    AND featured_image IS NOT NULL 
    AND featured_image != ''
ORDER BY published_at DESC;