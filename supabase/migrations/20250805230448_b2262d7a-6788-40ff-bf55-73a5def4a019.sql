-- Create consultation bookings table
CREATE TABLE public.consultation_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  service_area TEXT,
  preferred_date TIMESTAMP WITH TIME ZONE,
  preferred_time TEXT,
  message TEXT NOT NULL,
  urgency_level TEXT NOT NULL DEFAULT 'standard',
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.consultation_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can create consultation bookings" 
ON public.consultation_bookings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage all consultation bookings" 
ON public.consultation_bookings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_consultation_bookings_updated_at
BEFORE UPDATE ON public.consultation_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();