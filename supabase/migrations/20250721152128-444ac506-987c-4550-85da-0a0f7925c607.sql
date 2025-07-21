-- Create linkedin_articles table for storing synced LinkedIn content
CREATE TABLE IF NOT EXISTS public.linkedin_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    linkedin_id TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    visibility TEXT DEFAULT 'PUBLIC',
    is_migrated BOOLEAN DEFAULT false,
    migrated_article_id UUID,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on linkedin_articles
ALTER TABLE public.linkedin_articles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for linkedin_articles
CREATE POLICY "Users can view their own LinkedIn articles" 
ON public.linkedin_articles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own LinkedIn articles" 
ON public.linkedin_articles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own LinkedIn articles" 
ON public.linkedin_articles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own LinkedIn articles" 
ON public.linkedin_articles 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_linkedin_articles_user_id ON public.linkedin_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_articles_linkedin_id ON public.linkedin_articles(linkedin_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_articles_published_at ON public.linkedin_articles(published_at);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_linkedin_articles_updated_at
    BEFORE UPDATE ON public.linkedin_articles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();