-- Create a privacy-focused view for public profiles with limited columns
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
    user_id,
    display_name,
    avatar_url,
    created_at
FROM public.profiles;

-- Grant SELECT permission to anon and authenticated users
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_profiles TO authenticated;

-- Add comment explaining the view's purpose
COMMENT ON VIEW public.public_profiles IS 'Privacy-focused view of user profiles with limited data exposure for public access';