-- Create edge functions for comprehensive economic data collection
-- Update article form to generate slug on creation/update

-- First, create a function to generate slugs
CREATE OR REPLACE FUNCTION public.generate_slug(title_text text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(title_text, '[^a-zA-Z0-9\s\-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '\-+', '-', 'g'
    )
  );
END;
$$;

-- Create trigger function to auto-generate slugs
CREATE OR REPLACE FUNCTION public.update_article_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Generate slug from title if not provided
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = generate_slug(NEW.title);
    
    -- Ensure uniqueness by appending number if needed
    WHILE EXISTS (SELECT 1 FROM articles WHERE slug = NEW.slug AND id != NEW.id) LOOP
      NEW.slug = generate_slug(NEW.title) || '-' || floor(random() * 1000)::text;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic slug generation
DROP TRIGGER IF EXISTS trigger_update_article_slug ON articles;
CREATE TRIGGER trigger_update_article_slug
  BEFORE INSERT OR UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_article_slug();

-- Populate insights with sample data for testing (if table is empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM insights LIMIT 1) THEN
    INSERT INTO insights (title, content, data_source, series_id, indicator_type, region, data_points, is_published) VALUES
    ('US GDP Growth Rate', 'Real Gross Domestic Product measures the inflation adjusted value of all goods and services produced by the economy.', 'FRED', 'A191RL1Q225SBEA', 'gdp', 'US', '[{"date": "2024-06-01", "value": "2.8"}, {"date": "2024-03-01", "value": "3.1"}]'::jsonb, true),
    ('Unemployment Rate', 'The unemployment rate represents the number of unemployed as a percentage of the labor force.', 'FRED', 'UNRATE', 'unemployment', 'US', '[{"date": "2024-07-01", "value": "4.0"}, {"date": "2024-06-01", "value": "4.1"}]'::jsonb, true),
    ('Consumer Price Index', 'The Consumer Price Index measures the average change in prices paid by urban consumers for a basket of goods and services.', 'FRED', 'CPIAUCSL', 'inflation', 'US', '[{"date": "2024-07-01", "value": "3.2"}, {"date": "2024-06-01", "value": "3.3"}]'::jsonb, true);
  END IF;
END $$;