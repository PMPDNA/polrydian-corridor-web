-- Create a table to store social media credentials and IDs
CREATE TABLE public.social_media_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'instagram')),
  platform_user_id TEXT NOT NULL,
  access_token_encrypted TEXT,
  profile_data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Enable RLS
ALTER TABLE public.social_media_credentials ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all credentials" 
ON public.social_media_credentials 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage their own credentials" 
ON public.social_media_credentials 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for timestamps
CREATE TRIGGER update_social_credentials_updated_at
BEFORE UPDATE ON public.social_media_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for LinkedIn (replace with your actual data)
-- You'll need to update this with your real LinkedIn person ID
INSERT INTO public.social_media_credentials (user_id, platform, platform_user_id, profile_data)
SELECT 
  auth.uid(),
  'linkedin',
  'YOUR_LINKEDIN_PERSON_ID', -- Replace this with your actual LinkedIn person ID
  '{"company_page_id": "YOUR_COMPANY_PAGE_ID"}'::jsonb
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, platform) DO NOTHING;