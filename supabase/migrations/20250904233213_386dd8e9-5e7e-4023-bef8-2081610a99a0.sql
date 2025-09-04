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
USING (auth.role() = 'service_role'::text)
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

-- Add audit logging for access to sensitive consent data
CREATE OR REPLACE FUNCTION public.log_consent_data_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log access to consent data for security monitoring
  IF TG_OP = 'SELECT' AND auth.uid() IS NOT NULL THEN
    INSERT INTO public.security_audit_log (
      user_id,
      action,
      details
    ) VALUES (
      auth.uid(),
      'consent_data_accessed',
      jsonb_build_object(
        'table', 'cookie_consent_tracking',
        'operation', TG_OP,
        'timestamp', now(),
        'severity', 'medium'
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create trigger to log access to consent data
CREATE TRIGGER log_consent_access_trigger
  AFTER SELECT ON public.cookie_consent_tracking
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.log_consent_data_access();

-- Add index for performance while maintaining security
CREATE INDEX IF NOT EXISTS idx_cookie_consent_ip_created 
ON public.cookie_consent_tracking(ip_address, created_at);