-- Fix track-visitor edge function database constraints and IP address handling

-- First, let's check and fix the visitor_analytics table structure
-- Add unique constraint to prevent duplicate entries
ALTER TABLE public.visitor_analytics 
ADD CONSTRAINT unique_visitor_session 
UNIQUE (visitor_id, session_id, page_url);

-- Add constraint for user_consent table to support ON CONFLICT
ALTER TABLE public.user_consent 
ADD CONSTRAINT unique_visitor_consent_type 
UNIQUE (visitor_id, consent_type);

-- Create index for better performance on IP lookups
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_ip 
ON public.visitor_analytics (ip_address);

-- Create index for better performance on consent lookups
CREATE INDEX IF NOT EXISTS idx_user_consent_visitor 
ON public.user_consent (visitor_id);

-- Update the IP address column to handle multiple IPs correctly
-- Add a function to extract the first valid IP from comma-separated list
CREATE OR REPLACE FUNCTION public.extract_first_ip(ip_string text)
RETURNS inet AS $$
BEGIN
  -- Handle null or empty input
  IF ip_string IS NULL OR trim(ip_string) = '' THEN
    RETURN NULL;
  END IF;
  
  -- Split by comma and take the first valid IP
  DECLARE
    ip_parts text[];
    cleaned_ip text;
  BEGIN
    ip_parts := string_to_array(ip_string, ',');
    cleaned_ip := trim(ip_parts[1]);
    
    -- Validate that it's a proper IP address
    IF cleaned_ip ~ '^([0-9]{1,3}\.){3}[0-9]{1,3}$' OR cleaned_ip ~ '^([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}$' THEN
      RETURN cleaned_ip::inet;
    ELSE
      RETURN NULL;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;