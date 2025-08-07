-- Enable leaked password protection for better security
-- This is handled in the Supabase Auth dashboard, but we can document it
INSERT INTO admin_configuration (setting_name, setting_value)
VALUES (
  'password_security_note',
  '{"note": "Leaked password protection should be enabled in Supabase Auth dashboard", "timestamp": "2025-08-07", "status": "pending"}'
) ON CONFLICT (setting_name) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = now();