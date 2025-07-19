-- GDPR Compliance and Visitor Tracking System

-- Create visitor tracking table
CREATE TABLE public.visitor_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  page_url TEXT NOT NULL,
  referrer TEXT,
  session_id TEXT NOT NULL,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  screen_resolution TEXT,
  language TEXT,
  timezone TEXT,
  visit_duration INTEGER, -- in seconds
  page_views INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create consent management table
CREATE TABLE public.user_consent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  ip_address INET,
  consent_type TEXT NOT NULL, -- 'analytics', 'marketing', 'necessary'
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  withdrawal_date TIMESTAMP WITH TIME ZONE,
  legal_basis TEXT, -- 'consent', 'legitimate_interest', 'contract'
  purpose TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create data deletion requests table
CREATE TABLE public.gdpr_deletion_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  visitor_id TEXT,
  ip_address INET,
  request_type TEXT NOT NULL, -- 'deletion', 'export', 'rectification'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
  reason TEXT,
  requested_data JSONB,
  processed_by UUID,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create data processing log
CREATE TABLE public.data_processing_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  visitor_id TEXT,
  action TEXT NOT NULL, -- 'collected', 'processed', 'shared', 'deleted'
  data_type TEXT NOT NULL, -- 'analytics', 'personal', 'technical'
  purpose TEXT NOT NULL,
  legal_basis TEXT NOT NULL,
  retention_period TEXT,
  third_parties JSONB, -- list of third parties data was shared with
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.visitor_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gdpr_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_processing_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for visitor_analytics
CREATE POLICY "Admins can manage all analytics data" 
ON public.visitor_analytics 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Analytics data is aggregate only" 
ON public.visitor_analytics 
FOR SELECT 
USING (false); -- No direct access except for admins

-- RLS Policies for user_consent
CREATE POLICY "Admins can manage all consent records" 
ON public.user_consent 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert consent records" 
ON public.user_consent 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for gdpr_deletion_requests
CREATE POLICY "Admins can manage deletion requests" 
ON public.gdpr_deletion_requests 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can create deletion requests" 
ON public.gdpr_deletion_requests 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for data_processing_log
CREATE POLICY "Admins can view processing logs" 
ON public.data_processing_log 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert processing logs" 
ON public.data_processing_log 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_visitor_analytics_visitor_id ON public.visitor_analytics(visitor_id);
CREATE INDEX idx_visitor_analytics_session_id ON public.visitor_analytics(session_id);
CREATE INDEX idx_visitor_analytics_created_at ON public.visitor_analytics(created_at);
CREATE INDEX idx_user_consent_visitor_id ON public.user_consent(visitor_id);
CREATE INDEX idx_user_consent_consent_type ON public.user_consent(consent_type);
CREATE INDEX idx_gdpr_deletion_requests_status ON public.gdpr_deletion_requests(status);
CREATE INDEX idx_data_processing_log_action ON public.data_processing_log(action);

-- Create trigger for updated_at
CREATE TRIGGER update_visitor_analytics_updated_at
BEFORE UPDATE ON public.visitor_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_consent_updated_at
BEFORE UPDATE ON public.user_consent
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gdpr_deletion_requests_updated_at
BEFORE UPDATE ON public.gdpr_deletion_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();