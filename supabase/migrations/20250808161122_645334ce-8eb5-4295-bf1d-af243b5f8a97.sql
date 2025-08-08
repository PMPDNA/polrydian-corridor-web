-- Continue optimizing RLS policies for better performance

-- Update social_media_credentials table policies
DROP POLICY IF EXISTS "Users can manage their own credentials" ON public.social_media_credentials;
DROP POLICY IF EXISTS "Admins can manage all credentials" ON public.social_media_credentials;

CREATE POLICY "Users can manage their own credentials" 
ON public.social_media_credentials 
FOR ALL 
USING (current_user_id() = user_id);

CREATE POLICY "Admins can manage all credentials" 
ON public.social_media_credentials 
FOR ALL 
USING (current_user_role() = 'admin');

-- Update outbound_shares table policies  
DROP POLICY IF EXISTS "Users can create their own shares" ON public.outbound_shares;
DROP POLICY IF EXISTS "Users can update their own shares" ON public.outbound_shares;
DROP POLICY IF EXISTS "Users can view their own shares" ON public.outbound_shares;
DROP POLICY IF EXISTS "Admins can manage all shares" ON public.outbound_shares;

CREATE POLICY "Users can create their own shares" 
ON public.outbound_shares 
FOR INSERT 
WITH CHECK (current_user_id() = user_id);

CREATE POLICY "Users can update their own shares" 
ON public.outbound_shares 
FOR UPDATE 
USING (current_user_id() = user_id);

CREATE POLICY "Users can view their own shares" 
ON public.outbound_shares 
FOR SELECT 
USING (current_user_id() = user_id);

CREATE POLICY "Admins can manage all shares" 
ON public.outbound_shares 
FOR ALL 
USING (current_user_role() = 'admin');

-- Update linkedin_articles table policies
DROP POLICY IF EXISTS "Users can delete their own LinkedIn articles" ON public.linkedin_articles;
DROP POLICY IF EXISTS "Users can insert their own LinkedIn articles" ON public.linkedin_articles;
DROP POLICY IF EXISTS "Users can update their own LinkedIn articles" ON public.linkedin_articles;
DROP POLICY IF EXISTS "Users can view their own LinkedIn articles" ON public.linkedin_articles;

CREATE POLICY "Users can delete their own LinkedIn articles" 
ON public.linkedin_articles 
FOR DELETE 
USING (current_user_id() = user_id);

CREATE POLICY "Users can insert their own LinkedIn articles" 
ON public.linkedin_articles 
FOR INSERT 
WITH CHECK (current_user_id() = user_id);

CREATE POLICY "Users can update their own LinkedIn articles" 
ON public.linkedin_articles 
FOR UPDATE 
USING (current_user_id() = user_id);

CREATE POLICY "Users can view their own LinkedIn articles" 
ON public.linkedin_articles 
FOR SELECT 
USING (current_user_id() = user_id);