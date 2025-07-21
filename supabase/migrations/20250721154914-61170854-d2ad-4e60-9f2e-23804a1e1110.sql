-- Improve social media credentials table
-- Drop existing if it has different structure and recreate with better schema
DROP TABLE IF EXISTS public.social_media_credentials CASCADE;

-- Create improved social media credentials table
CREATE TABLE public.social_media_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  platform text NOT NULL CHECK (platform IN ('linkedin', 'instagram', 'twitter')),
  access_token_encrypted text,
  refresh_token_encrypted text,
  expires_at timestamptz,
  platform_user_id text NOT NULL,
  profile_data jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Create LinkedIn posts table for feed display
CREATE TABLE IF NOT EXISTS public.linkedin_posts (
  id text PRIMARY KEY,
  author text,
  message text,
  media_url text,
  post_url text,
  created_at timestamptz,
  raw_data jsonb,
  is_visible boolean DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_media_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_posts ENABLE ROW LEVEL SECURITY;

-- RLS policies for social_media_credentials
CREATE POLICY "Admins can manage all credentials" 
ON public.social_media_credentials 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Users can manage their own credentials" 
ON public.social_media_credentials 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS policies for linkedin_posts
CREATE POLICY "Public can view visible LinkedIn posts" 
ON public.linkedin_posts 
FOR SELECT 
USING (is_visible = true);

CREATE POLICY "Admins can manage all LinkedIn posts" 
ON public.linkedin_posts 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Add updated_at trigger for social_media_credentials
CREATE TRIGGER update_social_media_credentials_updated_at
  BEFORE UPDATE ON public.social_media_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for linkedin_posts
CREATE TRIGGER update_linkedin_posts_updated_at
  BEFORE UPDATE ON public.linkedin_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_social_media_credentials_platform ON public.social_media_credentials(platform);
CREATE INDEX idx_social_media_credentials_user_id ON public.social_media_credentials(user_id);
CREATE INDEX idx_linkedin_posts_created_at ON public.linkedin_posts(created_at DESC);
CREATE INDEX idx_linkedin_posts_visible ON public.linkedin_posts(is_visible);