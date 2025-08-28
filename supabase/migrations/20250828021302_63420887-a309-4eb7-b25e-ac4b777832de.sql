-- Enable password strength and leaked password protection
-- This addresses the security linter warning

-- Enable password strength requirements
INSERT INTO auth.config (parameter, value) 
VALUES ('password_min_length', '8')
ON CONFLICT (parameter) DO UPDATE SET value = '8';

-- Note: Leaked password protection requires dashboard configuration
-- The user will need to enable this in the Supabase Dashboard under Authentication > Settings
-- This cannot be enabled via SQL migration as it requires external API configuration