-- Phase 1 Security Fixes: Role Self-Assignment Prevention and Audit Logging
-- Note: OTP configuration needs to be done in Supabase Auth settings, not via SQL

-- 1. Create security audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.security_audit_log 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert audit logs (no user restriction)
CREATE POLICY "System can insert audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- 2. Add additional RLS policy to prevent users from elevating their own roles
CREATE POLICY "Prevent role self-elevation" 
ON public.user_roles 
FOR UPDATE 
TO authenticated
USING (
  -- Users cannot update their own roles to admin or moderator
  NOT (
    auth.uid() = user_id 
    AND role IN ('admin'::app_role, 'moderator'::app_role)
  )
);

-- 3. Create trigger function to audit role changes and prevent unauthorized elevation
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log all role changes
  INSERT INTO public.security_audit_log (
    user_id, 
    action, 
    details
  ) VALUES (
    auth.uid(),
    'role_change',
    jsonb_build_object(
      'target_user_id', COALESCE(NEW.user_id, OLD.user_id),
      'old_role', CASE WHEN TG_OP = 'DELETE' THEN OLD.role ELSE NULL END,
      'new_role', CASE WHEN TG_OP = 'INSERT' THEN NEW.role 
                       WHEN TG_OP = 'UPDATE' THEN NEW.role 
                       ELSE NULL END,
      'operation', TG_OP
    )
  );

  -- Prevent users from elevating their own roles
  IF TG_OP = 'UPDATE' AND auth.uid() = NEW.user_id THEN
    IF OLD.role = 'user'::app_role AND NEW.role IN ('admin'::app_role, 'moderator'::app_role) THEN
      RAISE EXCEPTION 'Users cannot elevate their own roles to admin or moderator';
    END IF;
  END IF;

  -- Prevent users from inserting admin/moderator roles for themselves
  IF TG_OP = 'INSERT' AND auth.uid() = NEW.user_id THEN
    IF NEW.role IN ('admin'::app_role, 'moderator'::app_role) THEN
      RAISE EXCEPTION 'Users cannot assign admin or moderator roles to themselves';
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 4. Create trigger for role change auditing and validation
DROP TRIGGER IF EXISTS audit_user_role_changes ON public.user_roles;
CREATE TRIGGER audit_user_role_changes
  BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();

-- 5. Create updated_at trigger for security audit log
CREATE TRIGGER update_security_audit_log_updated_at
  BEFORE UPDATE ON public.security_audit_log
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();