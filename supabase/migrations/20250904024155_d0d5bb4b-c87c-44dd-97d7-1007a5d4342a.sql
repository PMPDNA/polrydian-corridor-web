-- Fix Security Definer View issue by dropping and recreating public_profiles view
-- The public_profiles view bypasses RLS which is a security risk

-- Drop the existing view that bypasses RLS
DROP VIEW IF EXISTS public.public_profiles;

-- Note: The public_profiles view is not needed as we already have proper RLS policies
-- on the profiles table that allow public viewing. Clients should query profiles directly.
-- This removes the security bypass without breaking functionality.