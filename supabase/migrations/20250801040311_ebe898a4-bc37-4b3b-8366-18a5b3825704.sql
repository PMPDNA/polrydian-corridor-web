-- Create integration_logs table for comprehensive monitoring
CREATE TABLE public.integration_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_type TEXT NOT NULL, -- 'linkedin', 'instagram', 'email', 'economic_insights', 'zapier'
  operation TEXT NOT NULL, -- 'sync', 'auth', 'publish', 'fetch', 'webhook'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'error', 'timeout'
  user_id UUID REFERENCES auth.users(id),
  error_message TEXT,
  error_code TEXT,
  request_data JSONB,
  response_data JSONB,
  execution_time_ms INTEGER,
  retry_count INTEGER DEFAULT 0,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all integration logs" 
ON public.integration_logs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert integration logs" 
ON public.integration_logs 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_integration_logs_type_status ON public.integration_logs(integration_type, status);
CREATE INDEX idx_integration_logs_created_at ON public.integration_logs(created_at DESC);
CREATE INDEX idx_integration_logs_user_id ON public.integration_logs(user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_integration_logs_updated_at
  BEFORE UPDATE ON public.integration_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to log integration events
CREATE OR REPLACE FUNCTION public.log_integration_event(
  p_integration_type TEXT,
  p_operation TEXT,
  p_status TEXT DEFAULT 'pending',
  p_user_id UUID DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_error_code TEXT DEFAULT NULL,
  p_request_data JSONB DEFAULT NULL,
  p_response_data JSONB DEFAULT NULL,
  p_execution_time_ms INTEGER DEFAULT NULL,
  p_retry_count INTEGER DEFAULT 0
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  log_id UUID;
  client_ip INET;
  client_user_agent TEXT;
BEGIN
  -- Get client information
  client_ip := extract_first_ip(current_setting('request.headers', true)::jsonb ->> 'x-forwarded-for');
  client_user_agent := current_setting('request.headers', true)::jsonb ->> 'user-agent';
  
  -- Insert log entry
  INSERT INTO public.integration_logs (
    integration_type,
    operation,
    status,
    user_id,
    error_message,
    error_code,
    request_data,
    response_data,
    execution_time_ms,
    retry_count,
    ip_address,
    user_agent
  ) VALUES (
    p_integration_type,
    p_operation,
    p_status,
    COALESCE(p_user_id, auth.uid()),
    p_error_message,
    p_error_code,
    p_request_data,
    p_response_data,
    p_execution_time_ms,
    p_retry_count,
    client_ip,
    client_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;