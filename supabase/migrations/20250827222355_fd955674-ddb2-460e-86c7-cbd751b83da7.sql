-- Phase 1: Critical RLS fixes for user_roles table
-- Drop the overly permissive policies first
DROP POLICY IF EXISTS "Users can update their roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can update user roles" ON public.user_roles;

-- Create secure RLS policies for user_roles
CREATE POLICY "Admins can manage all user roles" 
ON public.user_roles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Phase 4: Secure storage policies
-- Update images bucket policies
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;

-- Secure image uploads - authenticated users only
CREATE POLICY "Authenticated users can upload to images bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own images in images bucket" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Secure avatars bucket
CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Secure mobile-uploads bucket (private access only)
CREATE POLICY "Users can upload to mobile-uploads" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'mobile-uploads' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view their own mobile uploads" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'mobile-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Phase 5: Rate limiting for public submissions
-- Enhanced rate limiting function for contact forms
CREATE OR REPLACE FUNCTION public.check_contact_form_rate_limit(client_ip inet)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  recent_submissions integer;
BEGIN
  -- Check submissions from same IP in last hour
  SELECT COUNT(*) INTO recent_submissions
  FROM consultation_bookings cb
  JOIN integration_logs il ON il.operation = 'contact_form_submission'
  WHERE il.ip_address = client_ip
  AND il.created_at > now() - interval '1 hour';
  
  -- Allow max 3 submissions per IP per hour
  RETURN recent_submissions < 3;
END;
$$;