-- Create article views tracking system
CREATE TABLE IF NOT EXISTS public.article_views (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    article_id UUID NOT NULL,
    user_id UUID,
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT article_views_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_article_views_article_id ON public.article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_user_id ON public.article_views(user_id);
CREATE INDEX IF NOT EXISTS idx_article_views_created_at ON public.article_views(created_at);
CREATE INDEX IF NOT EXISTS idx_article_views_session_article ON public.article_views(session_id, article_id);

-- Add view_count column to articles table
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create function to get unique views for an article
CREATE OR REPLACE FUNCTION get_article_unique_views(article_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN (
        SELECT COUNT(DISTINCT COALESCE(user_id::text, session_id, ip_address::text))
        FROM public.article_views
        WHERE article_id = article_uuid
    );
END;
$$;

-- Create function to update article view count
CREATE OR REPLACE FUNCTION update_article_view_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update the view count in articles table
    UPDATE public.articles 
    SET view_count = get_article_unique_views(NEW.article_id)
    WHERE id = NEW.article_id;
    
    RETURN NEW;
END;
$$;

-- Create trigger to automatically update view counts
DROP TRIGGER IF EXISTS trigger_update_article_view_count ON public.article_views;
CREATE TRIGGER trigger_update_article_view_count
    AFTER INSERT ON public.article_views
    FOR EACH ROW
    EXECUTE FUNCTION update_article_view_count();

-- Enable RLS
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for article_views
CREATE POLICY "Admins can view all article views" ON public.article_views
    FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert article views" ON public.article_views
    FOR INSERT WITH CHECK (auth.role() = 'service_role'::text);

CREATE POLICY "Users can view their own article views" ON public.article_views
    FOR SELECT USING (auth.uid() = user_id);

-- Create aggregated article analytics view
CREATE OR REPLACE VIEW public.article_analytics 
WITH (security_invoker = true) AS
SELECT 
    a.id,
    a.title,
    a.slug,
    a.category,
    a.published_at,
    a.view_count,
    COUNT(av.id) as total_views,
    COUNT(DISTINCT av.user_id) as unique_users,
    COUNT(DISTINCT av.session_id) as unique_sessions,
    COUNT(DISTINCT av.ip_address) as unique_ips,
    DATE_TRUNC('day', av.created_at) as view_date
FROM public.articles a
LEFT JOIN public.article_views av ON a.id = av.article_id
WHERE a.status = 'published'
GROUP BY a.id, a.title, a.slug, a.category, a.published_at, a.view_count, DATE_TRUNC('day', av.created_at)
ORDER BY a.published_at DESC;