-- Create images table for managing article and company logo images
CREATE TABLE public.images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT NOT NULL,
  alt_text TEXT,
  category TEXT NOT NULL DEFAULT 'general', -- 'article', 'company_logo', 'general', 'event', 'profile'
  tags TEXT[],
  uploaded_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view public images" 
ON public.images 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Authenticated users can view all images" 
ON public.images 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can upload images" 
ON public.images 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own images" 
ON public.images 
FOR UPDATE 
TO authenticated
USING (auth.uid() = uploaded_by);

CREATE POLICY "Admins can manage all images" 
ON public.images 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true);

-- Create storage policies
CREATE POLICY "Public can view images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Users can update their own images" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own images" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add updated_at trigger
CREATE TRIGGER update_images_updated_at
  BEFORE UPDATE ON public.images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();