-- Add policy to allow service role (cron jobs) to read social media credentials
CREATE POLICY "Service role can read credentials for cron jobs"
ON public.social_media_credentials
FOR SELECT
USING (auth.role() = 'service_role');