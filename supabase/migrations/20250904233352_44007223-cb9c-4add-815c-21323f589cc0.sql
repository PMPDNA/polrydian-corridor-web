-- Fix critical security vulnerability in cookie_consent_tracking table
-- Drop the overly permissive policy that allows public access to all data
DROP POLICY IF EXISTS "Allow anonymous consent tracking" ON public.cookie_consent_tracking;

-- Create restrictive policies that protect visitor privacy while maintaining functionality

-- Policy 1: Allow admin users to view and manage all consent data
CREATE POLICY "Admins can manage all consent data" 
ON public.cookie_consent_tracking 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role)) 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Policy 2: Allow edge functions to insert consent data (service role only)
CREATE POLICY "Service role can insert consent data" 
ON public.cookie_consent_tracking 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role'::text);

-- Policy 3: Allow edge functions to select consent data (service role only) 
CREATE POLICY "Service role can select consent data" 
ON public.cookie_consent_tracking 
FOR SELECT 
USING (auth.role() = 'service_role'::text);

-- Policy 4: Allow edge functions to update consent data (service role only)
CREATE POLICY "Service role can update consent data" 
ON public.cookie_consent_tracking 
FOR UPDATE 
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

-- Add index for performance while maintaining security
CREATE INDEX IF NOT EXISTS idx_cookie_consent_ip_created 
ON public.cookie_consent_tracking(ip_address, created_at);

-- Log this security fix in the audit log
INSERT INTO public.security_audit_log (
  action,
  details
) VALUES (
  'security_vulnerability_fixed',
  jsonb_build_object(
    'vulnerability', 'cookie_consent_tracking_public_access',
    'description', 'Fixed publicly readable visitor IP addresses and consent data',
    'severity', 'critical',
    'timestamp', now(),
    'remediation', 'Implemented restrictive RLS policies allowing only admin and service role access'
  )
);