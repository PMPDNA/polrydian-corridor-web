-- Update RLS policies for public access and traffic growth

-- Allow public access to published articles
DROP POLICY IF EXISTS "Anyone can view published articles" ON public.articles;
CREATE POLICY "Public can view published articles" 
ON public.articles 
FOR SELECT 
USING (status = 'published');

-- Allow public access to visible social media posts for traffic
DROP POLICY IF EXISTS "Public can view visible posts" ON public.social_media_posts;
CREATE POLICY "Public can view visible posts" 
ON public.social_media_posts 
FOR SELECT 
USING (is_visible = true AND approval_status = 'approved');

-- Allow public access to visible gallery items
DROP POLICY IF EXISTS "Public can view visible gallery items" ON public.gallery;
CREATE POLICY "Public can view visible gallery items" 
ON public.gallery 
FOR SELECT 
USING (is_visible = true);

-- Allow public access to visible LinkedIn posts  
DROP POLICY IF EXISTS "Anyone can view visible LinkedIn posts" ON public.linkedin_posts;
CREATE POLICY "Public can view visible LinkedIn posts"
ON public.linkedin_posts
FOR SELECT
USING (is_visible = true);

-- Update visitor analytics to allow admin monitoring while protecting individual privacy
DROP POLICY IF EXISTS "Analytics data is aggregate only" ON public.visitor_analytics;
CREATE POLICY "Admins can view analytics for monitoring"
ON public.visitor_analytics
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow public article submission for community growth
DROP POLICY IF EXISTS "Anyone can create submissions" ON public.article_submissions;
CREATE POLICY "Public can submit articles"
ON public.article_submissions
FOR INSERT
WITH CHECK (true);