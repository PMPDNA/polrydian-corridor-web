-- Clean up any existing LinkedIn credentials to start fresh
DELETE FROM social_media_credentials WHERE platform = 'linkedin';