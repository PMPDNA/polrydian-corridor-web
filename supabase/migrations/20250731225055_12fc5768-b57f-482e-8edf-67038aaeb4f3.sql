-- Add SEO and content enhancement fields to articles table
ALTER TABLE public.articles 
ADD COLUMN meta_description TEXT,
ADD COLUMN keywords TEXT[],
ADD COLUMN featured_image TEXT,
ADD COLUMN slug TEXT UNIQUE,
ADD COLUMN reference_sources JSONB DEFAULT '[]'::jsonb,
ADD COLUMN related_articles UUID[],
ADD COLUMN reading_time_minutes INTEGER;

-- Add index for slug lookups
CREATE INDEX idx_articles_slug ON public.articles(slug);

-- Add index for keywords search
CREATE INDEX idx_articles_keywords ON public.articles USING GIN(keywords);

-- Create article submissions table for contribution workflow
CREATE TABLE public.article_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_description TEXT,
  keywords TEXT[],
  reference_sources JSONB DEFAULT '[]'::jsonb,
  submitter_name TEXT NOT NULL,
  submitter_email TEXT NOT NULL,
  submitter_message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on article submissions
ALTER TABLE public.article_submissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for article submissions
CREATE POLICY "Admins can manage all submissions"
ON public.article_submissions
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can create submissions"
ON public.article_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_article_submissions_updated_at
BEFORE UPDATE ON public.article_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();