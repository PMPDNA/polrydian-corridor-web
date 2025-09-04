-- Create cookie_consent_tracking table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.cookie_consent_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL UNIQUE,
  consent_data JSONB NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cookie_consent_tracking ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous access (since this is for tracking consent)
CREATE POLICY "Allow anonymous consent tracking" 
ON public.cookie_consent_tracking 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_cookie_consent_ip ON public.cookie_consent_tracking(ip_address);