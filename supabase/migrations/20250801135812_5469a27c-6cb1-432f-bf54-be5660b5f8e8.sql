-- Phase 1: Critical Security Fixes (Corrected)

-- Fix function search path vulnerabilities
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Fix existing functions to have proper search path
    FOR func_record IN 
        SELECT schemaname, functionname 
        FROM pg_stat_user_functions 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER FUNCTION %I.%I SET search_path = public', 
                      func_record.schemaname, func_record.functionname);
    END LOOP;
END $$;

-- Strengthen image upload security with file validation
CREATE OR REPLACE FUNCTION public.validate_image_upload(
  file_name text,
  file_size bigint,
  file_type text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check file size (max 10MB)
  IF file_size > 10485760 THEN
    RAISE EXCEPTION 'File size exceeds 10MB limit';
  END IF;
  
  -- Check allowed file types
  IF file_type NOT IN ('image/jpeg', 'image/png', 'image/webp', 'image/gif') THEN
    RAISE EXCEPTION 'File type not allowed. Only JPEG, PNG, WebP, and GIF are supported';
  END IF;
  
  -- Check for suspicious file names
  IF file_name ~* '\.(php|js|html|exe|bat|sh|cmd)$' THEN
    RAISE EXCEPTION 'Suspicious file extension detected';
  END IF;
  
  RETURN true;
END;
$$;

-- Add file validation trigger
CREATE OR REPLACE FUNCTION public.validate_image_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate image upload if required fields are present
  IF NEW.file_size IS NOT NULL AND NEW.file_type IS NOT NULL THEN
    PERFORM validate_image_upload(NEW.name, NEW.file_size, NEW.file_type);
  END IF;
  
  -- Log security event
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    details
  ) VALUES (
    auth.uid(),
    'image_upload',
    jsonb_build_object(
      'file_name', NEW.name,
      'file_size', NEW.file_size,
      'file_type', NEW.file_type,
      'category', NEW.category
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for image validation
DROP TRIGGER IF EXISTS validate_image_upload_trigger ON public.images;
CREATE TRIGGER validate_image_upload_trigger
  BEFORE INSERT ON public.images
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_image_insert();

-- Enhance article-image relationship
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS image_associations jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS content_images text[] DEFAULT '{}';

-- Create function to sync featured_image with image gallery
CREATE OR REPLACE FUNCTION public.sync_article_images()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If featured_image is updated, ensure it exists in images table
  IF NEW.featured_image IS NOT NULL AND NEW.featured_image != '' THEN
    INSERT INTO public.images (
      file_path,
      name,
      category,
      alt_text,
      uploaded_by,
      file_type,
      is_public
    ) VALUES (
      NEW.featured_image,
      COALESCE(NEW.title, 'Article Image'),
      'hero',
      NEW.title,
      NEW.user_id,
      'image/jpeg',
      true
    ) ON CONFLICT (file_path) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for article image sync
DROP TRIGGER IF EXISTS sync_article_images_trigger ON public.articles;
CREATE TRIGGER sync_article_images_trigger
  AFTER INSERT OR UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_article_images();

-- Add unique constraint to prevent duplicate image paths (corrected syntax)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_file_path' 
        AND conrelid = 'public.images'::regclass
    ) THEN
        ALTER TABLE public.images ADD CONSTRAINT unique_file_path UNIQUE (file_path);
    END IF;
END $$;

-- Create image usage tracking
CREATE TABLE IF NOT EXISTS public.image_usage (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  image_id uuid REFERENCES public.images(id) ON DELETE CASCADE,
  article_id uuid REFERENCES public.articles(id) ON DELETE CASCADE,
  usage_type text NOT NULL CHECK (usage_type IN ('featured', 'content', 'gallery')),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(image_id, article_id, usage_type)
);

-- Enable RLS on image usage
ALTER TABLE public.image_usage ENABLE ROW LEVEL SECURITY;

-- Create policy for image usage
CREATE POLICY "Admins can manage image usage"
ON public.image_usage
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));