-- Phase 1: Secure Rate Limiting Store
-- Remove the overly permissive policy on auth_rate_limits
DROP POLICY IF EXISTS "System can manage rate limits" ON public.auth_rate_limits;

-- Add service_role-only policy for auth_rate_limits
CREATE POLICY "Service role can manage rate limits"
ON public.auth_rate_limits
FOR ALL
USING (auth.role() = 'service_role');

-- Add admin read-only policy for auth_rate_limits
CREATE POLICY "Admins can view rate limits"
ON public.auth_rate_limits
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Phase 2: Secure Audit Logging
-- Remove overly permissive policies on security_audit_log
DROP POLICY IF EXISTS "System can insert audit logs" ON public.security_audit_log;

-- Add service_role-only policy for security_audit_log
CREATE POLICY "Service role can insert audit logs"
ON public.security_audit_log
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Remove overly permissive policies on integration_logs
DROP POLICY IF EXISTS "System can insert integration logs" ON public.integration_logs;

-- Add service_role-only policy for integration_logs
CREATE POLICY "Service role can insert integration logs"
ON public.integration_logs
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Phase 3: Restrict Image Access
-- Remove overly permissive policy on images
DROP POLICY IF EXISTS "Authenticated users can view all images" ON public.images;

-- Add restricted image access policy
CREATE POLICY "Users can view public images and own uploads"
ON public.images
FOR SELECT
USING (
  is_public = true 
  OR uploaded_by = auth.uid() 
  OR has_role(auth.uid(), 'admin'::app_role)
);