-- Fix trigger syntax and create enhanced token functions
-- Ensure trigger for role changes exists (fix syntax)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'audit_role_changes_trigger' 
    AND tgrelid = 'public.user_roles'::regclass
  ) THEN
    CREATE TRIGGER audit_role_changes_trigger
      AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
      FOR EACH ROW EXECUTE FUNCTION public.audit_role_changes();
  END IF;
END
$$;