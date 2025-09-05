-- Fix security vulnerability: Ensure consultation_bookings is admin-only access
-- Drop conflicting public policies that may cause access issues
DROP POLICY IF EXISTS "Public cannot select consultation bookings" ON public.consultation_bookings;
DROP POLICY IF EXISTS "Public cannot delete consultation bookings" ON public.consultation_bookings;

-- Ensure only secure admin-only policies exist
-- Clear and recreate all policies to ensure no conflicts

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.consultation_bookings;
DROP POLICY IF EXISTS "Admins can update booking status" ON public.consultation_bookings;  
DROP POLICY IF EXISTS "Admins can delete consultation bookings" ON public.consultation_bookings;
DROP POLICY IF EXISTS "Public can submit consultation requests" ON public.consultation_bookings;

-- Recreate secure policies
-- Allow public to submit consultation requests (INSERT only)
CREATE POLICY "Allow public consultation submissions" 
ON public.consultation_bookings 
FOR INSERT 
WITH CHECK (true);

-- Admins can view all bookings
CREATE POLICY "Admins can view all consultation bookings" 
ON public.consultation_bookings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update booking status and notes
CREATE POLICY "Admins can update consultation bookings" 
ON public.consultation_bookings 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete bookings if needed
CREATE POLICY "Admins can delete consultation bookings" 
ON public.consultation_bookings 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Log this security fix
INSERT INTO public.security_audit_log (
  action,
  details,
  user_id
) VALUES (
  'consultation_bookings_security_fix',
  jsonb_build_object(
    'description', 'Fixed RLS policies to prevent public access to sensitive customer data',
    'tables_affected', ARRAY['consultation_bookings'],
    'security_level', 'critical',
    'timestamp', now()
  ),
  auth.uid()
);