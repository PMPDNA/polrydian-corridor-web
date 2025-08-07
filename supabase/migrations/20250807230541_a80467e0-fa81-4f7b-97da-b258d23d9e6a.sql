-- Phase A: Database improvements
-- Fix RLS policies, add indexes and triggers

-- Step 1: Clean up overlapping RLS policies on articles table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.articles;

-- Step 2: Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_user_id ON public.articles(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(created_at);

CREATE INDEX IF NOT EXISTS idx_insights_data_source ON public.insights(data_source);
CREATE INDEX IF NOT EXISTS idx_insights_is_published ON public.insights(is_published);
CREATE INDEX IF NOT EXISTS idx_insights_created_at ON public.insights(created_at);

CREATE INDEX IF NOT EXISTS idx_partners_is_visible ON public.partners(is_visible);
CREATE INDEX IF NOT EXISTS idx_partners_display_order ON public.partners(display_order);

CREATE INDEX IF NOT EXISTS idx_consultation_bookings_status ON public.consultation_bookings(status);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_created_at ON public.consultation_bookings(created_at);

-- Step 3: Add missing updated_at triggers
CREATE TRIGGER update_insights_updated_at
    BEFORE UPDATE ON public.insights
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partners_updated_at
    BEFORE UPDATE ON public.partners
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consultation_bookings_updated_at
    BEFORE UPDATE ON public.consultation_bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Step 4: Ensure articles have proper slug generation
CREATE TRIGGER update_articles_slug_trigger
    BEFORE INSERT OR UPDATE ON public.articles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_article_slug();

-- Step 5: Add content corruption prevention
CREATE TRIGGER prevent_articles_corruption
    BEFORE INSERT OR UPDATE ON public.articles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_content_corruption();