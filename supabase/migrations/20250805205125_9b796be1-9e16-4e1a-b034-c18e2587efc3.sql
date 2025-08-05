-- Create insights table for FRED and economic data
CREATE TABLE IF NOT EXISTS public.insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  data_source TEXT NOT NULL, -- 'FRED', 'Eurostat', 'OECD', etc.
  series_id TEXT NOT NULL,
  data_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  indicator_type TEXT NOT NULL, -- 'GDP', 'CPI', 'GSCPI', 'yield_curve', etc.
  region TEXT NOT NULL DEFAULT 'US', -- 'US', 'EU', 'Global'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_published BOOLEAN NOT NULL DEFAULT false,
  chart_config JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS for insights
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- Create policies for insights
CREATE POLICY "Public can view published insights" 
ON public.insights 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Admins can manage all insights" 
ON public.insights 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create newsletter_subscriptions table
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  interests JSONB DEFAULT '[]'::jsonb,
  source TEXT NOT NULL DEFAULT 'website',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for newsletter subscriptions
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for newsletter subscriptions
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscriptions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage newsletter subscriptions" 
ON public.newsletter_subscriptions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add partners table for organization logos
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'partner',
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for partners
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Create policies for partners
CREATE POLICY "Public can view visible partners" 
ON public.partners 
FOR SELECT 
USING (is_visible = true);

CREATE POLICY "Admins can manage partners" 
ON public.partners 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create content_schedule table for automated publishing
CREATE TABLE IF NOT EXISTS public.content_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_type TEXT NOT NULL, -- 'curated_article', 'monthly_summary', 'breaking_news'
  frequency_days INTEGER NOT NULL, -- 3 for curated, 30 for monthly
  last_executed TIMESTAMP WITH TIME ZONE,
  next_execution TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for content schedule
ALTER TABLE public.content_schedule ENABLE ROW LEVEL SECURITY;

-- Create policies for content schedule
CREATE POLICY "Admins can manage content schedule" 
ON public.content_schedule 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at columns
CREATE TRIGGER update_insights_updated_at
BEFORE UPDATE ON public.insights
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_newsletter_subscriptions_updated_at
BEFORE UPDATE ON public.newsletter_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partners_updated_at
BEFORE UPDATE ON public.partners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_content_schedule_updated_at
BEFORE UPDATE ON public.content_schedule
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial content schedule entries
INSERT INTO public.content_schedule (schedule_type, frequency_days, next_execution, config) VALUES
('curated_article', 3, now() + interval '3 days', '{"keywords": ["corridor economics", "geopolitics", "trade"], "sources": ["FRED", "think_tanks"]}'),
('monthly_summary', 30, now() + interval '30 days', '{"data_sources": ["FRED", "Eurostat"], "trend_analysis": true}'),
('breaking_news', 1, now() + interval '1 hour', '{"keywords": ["Suez Canal", "Belt and Road", "BRICS", "supply chain"], "immediate_publish": true}');

-- Insert initial partner data
INSERT INTO public.partners (name, logo_url, website_url, description, category, display_order) VALUES
('Maven Investment Partners', '/images/maven-investment-partners.png', 'https://maveninvestmentpartners.com', 'Strategic investment partnership', 'investment', 1),
('Lee & Associates', '/images/lee-associates.jpg', 'https://lee-associates.com', 'Commercial real estate expertise', 'real_estate', 2),
('KCC Capital', '/images/kcc-capital.png', '', 'Capital markets and investment', 'investment', 3),
('GMF Marshall Memorial Fellowship', '/images/gmf-fellowship.png', 'https://www.gmfus.org', 'Transatlantic policy fellowship', 'fellowship', 4),
('World Affairs Council of Miami', '/images/world-affairs-miami.png', 'https://wacmiami.org', 'Global affairs and policy', 'organization', 5);