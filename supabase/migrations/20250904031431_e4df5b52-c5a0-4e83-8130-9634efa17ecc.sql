-- Security Review Implementation: Fix Profile Access, Function Permissions & Audit Log Access
-- 1. Lock down profiles table - restrict public access
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create more restrictive policy - only authenticated users can view profiles
CREATE POLICY "Authenticated users can view profiles" ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 2. Restrict sensitive RPC functions to service_role only
-- Revoke from anon/authenticated and grant only to service_role
REVOKE EXECUTE ON FUNCTION public.check_contact_form_rate_limit(text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_contact_form_rate_limit(text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, integer, integer) TO service_role;

REVOKE EXECUTE ON FUNCTION public.enhanced_rate_limit_check(text, text, integer, integer) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enhanced_rate_limit_check(text, text, integer, integer) TO service_role;

REVOKE EXECUTE ON FUNCTION public.log_security_audit_event(text, jsonb, text, inet) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_security_audit_event(text, jsonb, text, inet) TO service_role;

REVOKE EXECUTE ON FUNCTION public.log_security_event_enhanced(text, jsonb, text, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_security_event_enhanced(text, jsonb, text, text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.encrypt_token_secure(text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.encrypt_token_secure(text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.decrypt_token_secure(text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrypt_token_secure(text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.migrate_existing_tokens() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.migrate_existing_tokens() TO service_role;

REVOKE EXECUTE ON FUNCTION public.rotate_expired_tokens() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rotate_expired_tokens() TO service_role;

-- 3. Standardize SECURITY DEFINER function search paths for consistency
ALTER FUNCTION public.encrypt_token_secure(text) SET search_path = 'pg_catalog', 'public';
ALTER FUNCTION public.decrypt_token_secure(text) SET search_path = 'pg_catalog', 'public';
ALTER FUNCTION public.check_rate_limit(text, integer, integer) SET search_path = 'pg_catalog', 'public';
ALTER FUNCTION public.enhanced_rate_limit_check(text, text, integer, integer) SET search_path = 'pg_catalog', 'public';
ALTER FUNCTION public.log_security_audit_event(text, jsonb, text, inet) SET search_path = 'pg_catalog', 'public';

-- Log the security hardening completion
INSERT INTO public.integration_logs (
  integration_type,
  operation,
  status,
  request_data
) VALUES (
  'security_hardening',
  'comprehensive_security_review_fixes',
  'success',
  jsonb_build_object(
    'fixes_applied', ARRAY[
      'restricted_profile_access',
      'locked_down_rpc_functions',
      'standardized_function_search_paths'
    ],
    'timestamp', now(),
    'security_level', 'enhanced'
  )
);