-- Create website_content table for universal content management
CREATE TABLE public.website_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_name TEXT NOT NULL,
  content_key TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'html', 'image', 'json'
  content_value TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(section_name, content_key)
);

-- Enable RLS
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view active content"
ON public.website_content
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage all content"
ON public.website_content
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_website_content_updated_at
BEFORE UPDATE ON public.website_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content for all sections
INSERT INTO public.website_content (section_name, content_key, content_type, content_value, description) VALUES
-- Hero Section
('hero', 'title', 'text', 'Transforming Complexity into Strategic Clarity', 'Main hero title'),
('hero', 'subtitle', 'text', 'Strategic consulting with Patrick Misiewicz, Founder of Polrydian Group', 'Hero subtitle'),
('hero', 'description', 'text', 'Specializing in corridor economics—mapping strategic flows of capital, technology, and expertise to transform complex global challenges into competitive advantages.', 'Hero description'),
('hero', 'primary_cta', 'text', 'Schedule Strategic Consultation', 'Primary CTA button text'),
('hero', 'secondary_cta', 'text', 'Learn About Our Approach', 'Secondary CTA button text'),

-- About Section
('about', 'title', 'text', 'About Patrick Misiewicz', 'About section title'),
('about', 'subtitle', 'text', 'Founder of Polrydian Group and Board Director at World Affairs Council of Miami', 'About subtitle'),
('about', 'description', 'text', 'Specializing in corridor economics—transforming geopolitical complexity into strategic opportunity across 60+ countries.', 'About description'),

-- Services Section
('services', 'title', 'text', 'Strategic Services', 'Services section title'),
('services', 'description', 'text', 'Comprehensive solutions for navigating complex global challenges and transforming obstacles into strategic opportunities', 'Services description'),

-- Contact Section
('contact', 'title', 'text', 'Schedule Strategic Consultation', 'Contact section title'),
('contact', 'description', 'text', 'Ready to transform complexity into clarity? Let''s discuss your strategic challenges.', 'Contact description'),

-- Footer Section
('footer', 'copyright', 'text', '© 2024 Polrydian Group. All rights reserved.', 'Footer copyright'),
('footer', 'tagline', 'text', 'Transforming Complexity into Strategic Clarity', 'Footer tagline');

-- Create content_versions table for versioning
CREATE TABLE public.content_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public.website_content(id) ON DELETE CASCADE,
  previous_value TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for content history
ALTER TABLE public.content_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view content history"
ON public.content_history
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert content history"
ON public.content_history
FOR INSERT
WITH CHECK (true);

-- Create function to track content changes
CREATE OR REPLACE FUNCTION public.track_content_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only track if content actually changed
  IF OLD.content_value != NEW.content_value THEN
    INSERT INTO public.content_history (
      content_id,
      previous_value,
      changed_by,
      change_reason
    ) VALUES (
      NEW.id,
      OLD.content_value,
      auth.uid(),
      'Content updated via admin panel'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for content change tracking
CREATE TRIGGER track_website_content_changes
AFTER UPDATE ON public.website_content
FOR EACH ROW
EXECUTE FUNCTION public.track_content_changes();