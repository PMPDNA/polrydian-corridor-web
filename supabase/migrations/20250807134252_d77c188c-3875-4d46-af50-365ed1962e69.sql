-- Re-enable a simplified, non-interfering trigger for future corruption prevention
CREATE OR REPLACE FUNCTION prevent_content_corruption()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only log corruption patterns but don't modify content
  -- Let frontend sanitization handle the cleaning
  IF NEW.content IS NOT NULL AND NEW.content ~ '([a-z])\1{3,}' THEN
    INSERT INTO public.integration_logs (
      integration_type, 
      operation, 
      status, 
      error_message,
      request_data
    ) VALUES (
      'content_validation',
      'corruption_detected',
      'warning',
      'Potential content corruption detected during save',
      jsonb_build_object(
        'article_id', NEW.id,
        'title', NEW.title,
        'user_id', NEW.user_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Re-create the trigger as monitoring only
CREATE TRIGGER monitor_content_integrity
  AFTER INSERT OR UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_content_corruption();

-- Log successful fix completion
INSERT INTO public.integration_logs (
  integration_type, 
  operation, 
  status, 
  error_message
) VALUES (
  'article_debug',
  'save_mechanism_fixed',
  'success',
  'Article saving mechanism restored - corruption removed and trigger updated to monitoring only'
);