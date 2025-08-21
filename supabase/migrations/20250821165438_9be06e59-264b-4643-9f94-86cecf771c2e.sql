-- Create storage policies for secure file handling
-- First, ensure storage buckets are properly configured

-- Update mobile-uploads bucket to be private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'mobile-uploads';

-- Create secure storage policies for mobile-uploads bucket
CREATE POLICY "Authenticated users can upload to mobile-uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'mobile-uploads' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own mobile uploads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'mobile-uploads'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can manage all mobile uploads"
ON storage.objects FOR ALL
USING (
  bucket_id = 'mobile-uploads'
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Secure images bucket - allow authenticated uploads, public reads
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images'
  AND auth.uid() IS NOT NULL
);

-- Create a secure RPC for security audit logging
CREATE OR REPLACE FUNCTION public.log_security_audit_event(
  p_action TEXT,
  p_details JSONB DEFAULT '{}',
  p_severity TEXT DEFAULT 'medium',
  p_ip_address INET DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    details,
    ip_address,
    user_agent,
    created_at
  ) VALUES (
    auth.uid(),
    p_action,
    jsonb_build_object(
      'severity', p_severity,
      'timestamp', now(),
      'details', p_details
    ),
    p_ip_address,
    current_setting('request.headers', true)::jsonb ->> 'user-agent',
    now()
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;

-- Fix user_consent table policies to prevent public access
DROP POLICY IF EXISTS "System can insert consent records" ON public.user_consent;
CREATE POLICY "Service role can insert consent records"
ON public.user_consent FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Ensure only admins can read consent records
DROP POLICY IF EXISTS "Public can insert consent" ON public.user_consent;
CREATE POLICY "Admins can view consent records"
ON public.user_consent FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Add admin check function for edge functions
CREATE OR REPLACE FUNCTION public.check_admin_access()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is admin
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  );
END;
$$;