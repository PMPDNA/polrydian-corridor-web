-- Fix the leaked password protection issue
UPDATE auth.config SET leaked_password_protection = true WHERE id = 'global';

-- Add performance monitoring table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  metadata JSONB DEFAULT '{}',
  user_agent TEXT,
  page_url TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on performance metrics
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy for performance metrics
CREATE POLICY "Allow anonymous performance metrics" 
ON public.performance_metrics 
FOR INSERT 
WITH CHECK (true);

-- Create policy for reading performance metrics (admin only)
CREATE POLICY "Admins can view performance metrics" 
ON public.performance_metrics 
FOR SELECT 
USING (auth.uid() IN (
  SELECT auth.uid() FROM auth.users 
  WHERE email IN ('patrick@polrydian.com', 'admin@polrydian.com')
));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type_created 
ON public.performance_metrics(metric_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_session 
ON public.performance_metrics(session_id, created_at DESC);

-- Create system health monitoring table
CREATE TABLE IF NOT EXISTS public.system_health_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  check_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PASS', 'FAIL', 'WARNING')),
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on system health checks
ALTER TABLE public.system_health_checks ENABLE ROW LEVEL SECURITY;

-- Create policy for system health checks (admin only)
CREATE POLICY "Admins can manage system health checks" 
ON public.system_health_checks 
FOR ALL 
USING (auth.uid() IN (
  SELECT auth.uid() FROM auth.users 
  WHERE email IN ('patrick@polrydian.com', 'admin@polrydian.com')
));

-- Add function to clean old performance data
CREATE OR REPLACE FUNCTION public.cleanup_old_performance_data()
RETURNS void AS $$
BEGIN
  -- Delete performance metrics older than 30 days
  DELETE FROM public.performance_metrics 
  WHERE created_at < now() - interval '30 days';
  
  -- Delete system health checks older than 7 days
  DELETE FROM public.system_health_checks 
  WHERE created_at < now() - interval '7 days';
END;
$$ LANGUAGE plpgsql;

-- Create automatic cleanup trigger
CREATE OR REPLACE FUNCTION public.trigger_cleanup_performance_data()
RETURNS trigger AS $$
BEGIN
  -- Run cleanup every 100 inserts
  IF (SELECT COUNT(*) FROM public.performance_metrics) % 100 = 0 THEN
    PERFORM public.cleanup_old_performance_data();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER performance_cleanup_trigger
  AFTER INSERT ON public.performance_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_cleanup_performance_data();