-- Fix security warnings by adding fixed search_path to functions
ALTER FUNCTION public.cleanup_old_performance_data() 
  SET search_path = pg_catalog, public;

ALTER FUNCTION public.trigger_cleanup_performance_data() 
  SET search_path = pg_catalog, public;

-- Create a stable function to get current user ID for RLS optimization
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT auth.uid();
$$;

-- Create a stable function to get current user role for RLS optimization
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = auth.uid() 
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1 
      WHEN 'moderator' THEN 2 
      WHEN 'user' THEN 3 
    END 
  LIMIT 1;
$$;