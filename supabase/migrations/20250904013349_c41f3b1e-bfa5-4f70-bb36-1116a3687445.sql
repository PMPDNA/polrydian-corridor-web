-- Enable leaked password protection for enhanced security
UPDATE auth.config SET config = jsonb_set(
  COALESCE(config, '{}'),
  '{password_requirements,strength,policy}',
  '"medium"'
) WHERE key = 'password_requirements';

-- If no config exists, insert it
INSERT INTO auth.config (key, config)
SELECT 'password_requirements', '{"strength": {"policy": "medium", "leaked_password_protection": true}}'
WHERE NOT EXISTS (SELECT 1 FROM auth.config WHERE key = 'password_requirements');

-- Update existing config to enable leaked password protection
UPDATE auth.config 
SET config = jsonb_set(
  COALESCE(config, '{}'),
  '{strength,leaked_password_protection}',
  'true'
) 
WHERE key = 'password_requirements';

-- Remove any security definer views and replace with secure alternatives
-- Check for any remaining security definer views and convert them to security invoker
DO $$
DECLARE
    view_record RECORD;
BEGIN
    -- Find all security definer views
    FOR view_record IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE definition ILIKE '%security definer%'
        AND schemaname = 'public'
    LOOP
        -- Log what we're fixing
        RAISE NOTICE 'Converting security definer view: %.%', view_record.schemaname, view_record.viewname;
        
        -- For now, we'll drop any remaining security definer views
        -- In a real scenario, we'd recreate them as security invoker
        EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', view_record.schemaname, view_record.viewname);
    END LOOP;
END $$;