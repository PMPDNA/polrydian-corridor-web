-- Clear any compromised LinkedIn credentials
DELETE FROM public.social_media_credentials WHERE platform = 'linkedin';