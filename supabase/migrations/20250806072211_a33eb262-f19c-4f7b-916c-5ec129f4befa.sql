-- Create CSIS articles table
CREATE TABLE IF NOT EXISTS public.csis_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  link TEXT NOT NULL UNIQUE,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create policy updates table
CREATE TABLE IF NOT EXISTS public.policy_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  headline TEXT NOT NULL,
  summary TEXT,
  source TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.csis_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_updates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Public can view CSIS articles"
ON public.csis_articles
FOR SELECT
USING (true);

CREATE POLICY "Public can view policy updates"
ON public.policy_updates
FOR SELECT
USING (true);

-- Create policies for admin management
CREATE POLICY "Admins can manage CSIS articles"
ON public.csis_articles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage policy updates"
ON public.policy_updates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_csis_articles_published_at ON public.csis_articles(published_at DESC);
CREATE INDEX idx_csis_articles_category ON public.csis_articles(category);
CREATE INDEX idx_policy_updates_published_at ON public.policy_updates(published_at DESC);
CREATE INDEX idx_policy_updates_tags ON public.policy_updates USING GIN(tags);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_csis_articles_updated_at
  BEFORE UPDATE ON public.csis_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_policy_updates_updated_at
  BEFORE UPDATE ON public.policy_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();