-- Add database indexes for improved article performance
-- Index for published articles (most common query)
CREATE INDEX IF NOT EXISTS idx_articles_status_published_at 
ON articles(status, published_at DESC) 
WHERE status = 'published';

-- Index for article archive queries with status and date filtering
CREATE INDEX IF NOT EXISTS idx_articles_status_created_at 
ON articles(status, created_at DESC);

-- Ensure slug is unique for published articles
ALTER TABLE articles ADD CONSTRAINT articles_slug_unique UNIQUE (slug);

-- Index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_articles_slug 
ON articles(slug) 
WHERE slug IS NOT NULL;