
-- Fix: Lock consultation_bookings INSERT to service_role only
-- This forces all submissions through the secure-contact-form edge function
-- which has proper rate limiting and input validation

-- Drop the overly permissive public insert policies
DROP POLICY IF EXISTS "Anyone can create consultation bookings" ON public.consultation_bookings;
DROP POLICY IF EXISTS "Allow public consultation submissions" ON public.consultation_bookings;

-- Only allow service_role (edge functions) to insert
CREATE POLICY "Service role can create bookings"
ON public.consultation_bookings
FOR INSERT
TO service_role
WITH CHECK (true);
