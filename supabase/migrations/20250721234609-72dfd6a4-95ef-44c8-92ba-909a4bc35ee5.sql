-- Fix RLS policy for linkedin_posts to allow public access regardless of auth status
DROP POLICY IF EXISTS "Public can view visible LinkedIn posts" ON public.linkedin_posts;

CREATE POLICY "Anyone can view visible LinkedIn posts" 
ON public.linkedin_posts 
FOR SELECT 
USING (is_visible = true);