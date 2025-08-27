-- Phase 1: Fix user_roles RLS - more targeted approach
-- First, let's see what policies exist and drop the problematic ones
DO $$
BEGIN
  -- Drop overly permissive policies if they exist
  DROP POLICY IF EXISTS "Users can update their roles" ON public.user_roles;
  DROP POLICY IF EXISTS "Authenticated users can update user roles" ON public.user_roles;
  DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;
EXCEPTION 
  WHEN OTHERS THEN NULL;
END $$;

-- Phase 4: Secure storage policies (more targeted)
-- Drop and recreate specific image policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
EXCEPTION 
  WHEN OTHERS THEN NULL;
END $$;

-- Create secure image upload policies
CREATE POLICY "Secure authenticated image uploads" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Secure image updates by owner" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Secure avatars bucket
CREATE POLICY "Secure avatar uploads" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Secure avatar updates" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Secure mobile-uploads bucket (private)
CREATE POLICY "Secure mobile upload access" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'mobile-uploads' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Private mobile upload view" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'mobile-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);