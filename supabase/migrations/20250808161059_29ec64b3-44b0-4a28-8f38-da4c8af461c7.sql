-- Optimize RLS policies to use stable functions instead of direct auth.uid() calls
-- This will resolve the 178 "Auth RLS Initialization Plan" warnings

-- Update profiles table policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (current_user_id() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (current_user_id() = user_id);

CREATE POLICY "Admins can delete any profile" 
ON public.profiles 
FOR DELETE 
USING (current_user_role() = 'admin');

-- Update user_roles table policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (current_user_id() = user_id);

CREATE POLICY "Admins can manage all user roles" 
ON public.user_roles 
FOR ALL 
USING (current_user_role() = 'admin');

-- Update client_preferences table policies
DROP POLICY IF EXISTS "Users can create their own preferences" ON public.client_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.client_preferences;
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.client_preferences;
DROP POLICY IF EXISTS "Admins can view all preferences" ON public.client_preferences;

CREATE POLICY "Users can create their own preferences" 
ON public.client_preferences 
FOR INSERT 
WITH CHECK (current_user_id() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.client_preferences 
FOR UPDATE 
USING (current_user_id() = user_id);

CREATE POLICY "Users can view their own preferences" 
ON public.client_preferences 
FOR SELECT 
USING (current_user_id() = user_id);

CREATE POLICY "Admins can view all preferences" 
ON public.client_preferences 
FOR SELECT 
USING (current_user_role() = 'admin');