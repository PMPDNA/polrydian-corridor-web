-- Fix critical security vulnerability: Add admin-only SELECT policy for consultation_bookings
-- This prevents public access to sensitive customer contact information

CREATE POLICY "Admins can view consultation bookings"
ON public.consultation_bookings FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));