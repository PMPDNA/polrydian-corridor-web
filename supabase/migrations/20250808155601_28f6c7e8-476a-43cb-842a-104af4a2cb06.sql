-- Fix security warnings by adding search_path to functions
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Fix trigger function security
CREATE OR REPLACE FUNCTION public.trigger_cleanup_performance_data()
RETURNS trigger AS $$
BEGIN
  -- Run cleanup every 100 inserts
  IF (SELECT COUNT(*) FROM public.performance_metrics) % 100 = 0 THEN
    PERFORM public.cleanup_old_performance_data();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';