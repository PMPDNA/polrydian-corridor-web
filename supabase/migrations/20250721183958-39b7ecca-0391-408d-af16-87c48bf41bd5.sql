-- Phase 1: Database Schema & Core Infrastructure

-- 1.1 Update social_media_credentials table (already exists, but let's ensure it has all needed columns)
-- Check if we need to add any missing columns
ALTER TABLE public.social_media_credentials 
ADD COLUMN IF NOT EXISTS platform_user_id text;

-- Add constraint to ensure platform is 'linkedin' for this integration
ALTER TABLE public.social_media_credentials 
ADD CONSTRAINT check_platform_linkedin 
CHECK (platform IN ('linkedin', 'instagram', 'twitter'));

-- Ensure unique constraint exists
ALTER TABLE public.social_media_credentials 
DROP CONSTRAINT IF EXISTS social_media_credentials_user_id_platform_key;

ALTER TABLE public.social_media_credentials 
ADD CONSTRAINT social_media_credentials_user_id_platform_key 
UNIQUE(user_id, platform);

-- 1.2 Create linkedin_posts table for pulled feed
CREATE TABLE IF NOT EXISTS public.linkedin_posts (
  id            text PRIMARY KEY,               -- LinkedIn URN
  author        text,
  message       text,
  media_url     text,
  post_url      text,
  created_at    timestamptz,
  raw_data      jsonb,
  is_visible    boolean DEFAULT true,
  synced_at     timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Enable RLS on linkedin_posts
ALTER TABLE public.linkedin_posts ENABLE ROW LEVEL SECURITY;

-- RLS policy for linkedin_posts - public can read visible posts
CREATE POLICY "Public can view visible LinkedIn posts" 
ON public.linkedin_posts 
FOR SELECT 
USING (is_visible = true);

-- RLS policy for linkedin_posts - admins can manage all
CREATE POLICY "Admins can manage all LinkedIn posts" 
ON public.linkedin_posts 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- 1.3 Create outbound_shares table for published-from-site log
CREATE TABLE IF NOT EXISTS public.outbound_shares (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_urn      text,           -- URN returned by LinkedIn
  article_id    uuid,           -- ID in your CMS
  user_id       uuid NOT NULL,  -- Who initiated the share
  status        text CHECK (status IN ('pending','posted','error')) DEFAULT 'pending',
  error_msg     text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Enable RLS on outbound_shares
ALTER TABLE public.outbound_shares ENABLE ROW LEVEL SECURITY;

-- RLS policies for outbound_shares
CREATE POLICY "Users can view their own shares" 
ON public.outbound_shares 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shares" 
ON public.outbound_shares 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shares" 
ON public.outbound_shares 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all shares" 
ON public.outbound_shares 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Add updated_at triggers
CREATE TRIGGER update_linkedin_posts_updated_at
  BEFORE UPDATE ON public.linkedin_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_outbound_shares_updated_at
  BEFORE UPDATE ON public.outbound_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_created_at ON public.linkedin_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_visible ON public.linkedin_posts(is_visible);
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_synced_at ON public.linkedin_posts(synced_at DESC);

CREATE INDEX IF NOT EXISTS idx_outbound_shares_user_id ON public.outbound_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_outbound_shares_article_id ON public.outbound_shares(article_id);
CREATE INDEX IF NOT EXISTS idx_outbound_shares_status ON public.outbound_shares(status);
CREATE INDEX IF NOT EXISTS idx_outbound_shares_created_at ON public.outbound_shares(created_at DESC);