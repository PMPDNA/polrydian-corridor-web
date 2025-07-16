-- Create storage bucket for avatars and user uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);

-- Create storage policies for avatar uploads
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own avatars" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Create storage bucket for documents and files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false);

-- Create policies for document uploads
CREATE POLICY "Users can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can upload documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Add avatar_url column to profiles table if it doesn't exist (it already exists based on schema)
-- This is just for completeness in case we need to reference it

-- Create a luxury client preferences table for enhanced experience
CREATE TABLE public.client_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  communication_preference TEXT DEFAULT 'email',
  timezone TEXT DEFAULT 'America/New_York',
  preferred_meeting_times JSONB DEFAULT '[]',
  industry_focus TEXT[],
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "calendar": true}',
  meeting_frequency TEXT DEFAULT 'as_needed',
  project_updates_frequency TEXT DEFAULT 'weekly',
  concierge_services BOOLEAN DEFAULT false,
  premium_support BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on client_preferences
ALTER TABLE public.client_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for client preferences
CREATE POLICY "Users can view their own preferences" 
ON public.client_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" 
ON public.client_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.client_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all preferences" 
ON public.client_preferences 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for timestamp updates
CREATE TRIGGER update_client_preferences_updated_at
BEFORE UPDATE ON public.client_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();