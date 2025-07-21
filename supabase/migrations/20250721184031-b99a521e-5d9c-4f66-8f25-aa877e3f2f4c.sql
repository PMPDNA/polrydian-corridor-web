-- Phase 1: Complete remaining database setup

-- Create outbound_shares table if it doesn't exist
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

-- Enable RLS on outbound_shares if not already enabled
ALTER TABLE public.outbound_shares ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view their own shares" ON public.outbound_shares;
DROP POLICY IF EXISTS "Users can create their own shares" ON public.outbound_shares;
DROP POLICY IF EXISTS "Users can update their own shares" ON public.outbound_shares;
DROP POLICY IF EXISTS "Admins can manage all shares" ON public.outbound_shares;

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

-- Add updated_at trigger for outbound_shares
DROP TRIGGER IF EXISTS update_outbound_shares_updated_at ON public.outbound_shares;
CREATE TRIGGER update_outbound_shares_updated_at
  BEFORE UPDATE ON public.outbound_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_outbound_shares_user_id ON public.outbound_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_outbound_shares_article_id ON public.outbound_shares(article_id);
CREATE INDEX IF NOT EXISTS idx_outbound_shares_status ON public.outbound_shares(status);
CREATE INDEX IF NOT EXISTS idx_outbound_shares_created_at ON public.outbound_shares(created_at DESC);

-- Ensure social_media_credentials has platform_user_id column
ALTER TABLE public.social_media_credentials 
ADD COLUMN IF NOT EXISTS platform_user_id text;