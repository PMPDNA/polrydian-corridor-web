-- Add performance indexes for articles table
CREATE INDEX IF NOT EXISTS idx_articles_published_status ON articles(status, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_user_id ON articles(user_id);

-- Full-text search index for better search performance
CREATE INDEX IF NOT EXISTS idx_articles_search ON articles USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '') || ' ' || COALESCE(meta_description, '')));

-- Add reading_time_minutes column if it doesn't exist (it appears to already exist based on schema)
-- This will store calculated reading time instead of calculating client-side

-- Index for published_at date filtering
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC) WHERE status = 'published';