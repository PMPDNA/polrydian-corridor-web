-- Create social media posts table
CREATE TABLE public.social_media_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL, -- 'instagram', 'linkedin'
  platform_post_id TEXT NOT NULL,
  post_type TEXT NOT NULL, -- 'post', 'article', 'share'
  title TEXT,
  content TEXT,
  image_url TEXT,
  post_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  engagement_data JSONB DEFAULT '{}',
  hashtags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(platform, platform_post_id)
);

-- Create gallery table for admin uploaded photos
CREATE TABLE public.gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT DEFAULT 'general',
  instagram_post_id TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create LinkedIn articles table
CREATE TABLE public.linkedin_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  linkedin_article_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  article_url TEXT,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  is_migrated BOOLEAN DEFAULT false,
  migrated_article_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_articles ENABLE ROW LEVEL SECURITY;

-- Create policies for social_media_posts
CREATE POLICY "Public can view visible posts" 
ON public.social_media_posts 
FOR SELECT 
USING (is_visible = true);

CREATE POLICY "Admins can manage all posts" 
ON public.social_media_posts 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for gallery
CREATE POLICY "Public can view visible gallery items" 
ON public.gallery 
FOR SELECT 
USING (is_visible = true);

CREATE POLICY "Admins can manage gallery" 
ON public.gallery 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policies for linkedin_articles
CREATE POLICY "Public can view all articles" 
ON public.linkedin_articles 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage articles" 
ON public.linkedin_articles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for timestamp updates
CREATE TRIGGER update_social_media_posts_updated_at
BEFORE UPDATE ON public.social_media_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gallery_updated_at
BEFORE UPDATE ON public.gallery
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_linkedin_articles_updated_at
BEFORE UPDATE ON public.linkedin_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for mobile uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('mobile-uploads', 'mobile-uploads', true);

-- Create storage policies for mobile uploads
CREATE POLICY "Mobile uploads are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'mobile-uploads');

CREATE POLICY "Admins can upload mobile photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'mobile-uploads' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update mobile uploads" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'mobile-uploads' AND has_role(auth.uid(), 'admin'::app_role));

-- Create function to sync LinkedIn articles to main articles table
CREATE OR REPLACE FUNCTION sync_linkedin_article_to_articles(linkedin_article_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_article_id UUID;
  linkedin_article RECORD;
BEGIN
  -- Get the LinkedIn article
  SELECT * INTO linkedin_article
  FROM public.linkedin_articles
  WHERE id = linkedin_article_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'LinkedIn article not found';
  END IF;
  
  -- Insert into articles table
  INSERT INTO public.articles (
    user_id,
    title,
    content,
    status,
    published_at
  ) VALUES (
    auth.uid(),
    linkedin_article.title,
    linkedin_article.content,
    'published',
    linkedin_article.published_at
  ) RETURNING id INTO new_article_id;
  
  -- Update LinkedIn article with migration info
  UPDATE public.linkedin_articles
  SET 
    is_migrated = true,
    migrated_article_id = new_article_id,
    updated_at = now()
  WHERE id = linkedin_article_id;
  
  RETURN new_article_id;
END;
$$;