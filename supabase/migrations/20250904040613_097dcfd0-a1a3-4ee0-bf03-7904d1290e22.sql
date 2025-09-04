-- Extensions for modern functionality
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS http;

-- Helper function for admin checks
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = uid AND ur.role = 'admin'::app_role
  );
$$;

-- Upgrade articles table for search and AI
ALTER TABLE public.articles 
  ADD COLUMN IF NOT EXISTS search_tsv tsvector,
  ADD COLUMN IF NOT EXISTS embedding vector(768);

CREATE INDEX IF NOT EXISTS idx_articles_tsv ON public.articles USING gin(search_tsv);
CREATE INDEX IF NOT EXISTS idx_articles_embedding ON public.articles USING ivfflat (embedding vector_cosine_ops);

-- Auto-update search index on article changes
CREATE OR REPLACE FUNCTION public.articles_search_tsv_trigger()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_tsv := to_tsvector('english',
    COALESCE(NEW.title,'') || ' ' || 
    COALESCE(NEW.meta_description,'') || ' ' || 
    COALESCE(NEW.content,'')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_articles_tsv ON public.articles;
CREATE TRIGGER trg_articles_tsv 
  BEFORE INSERT OR UPDATE ON public.articles 
  FOR EACH ROW EXECUTE PROCEDURE public.articles_search_tsv_trigger();

-- Social media accounts (secure token storage)
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider text CHECK (provider IN ('linkedin','instagram')) NOT NULL,
  access_token_encrypted text NOT NULL,
  refresh_token_encrypted text,
  expires_at timestamptz,
  profile_data jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, provider)
);

ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage social accounts" ON public.social_accounts
  FOR ALL USING (public.is_admin(auth.uid())) 
  WITH CHECK (public.is_admin(auth.uid()));

-- Scheduled social media posts
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  article_id uuid REFERENCES public.articles(id) ON DELETE CASCADE,
  channel text CHECK (channel IN ('linkedin','instagram')) NOT NULL,
  title text,
  body text NOT NULL,
  image_url text,
  article_url text,
  publish_at timestamptz NOT NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled','sent','failed','cancelled')),
  platform_post_id text,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their scheduled posts" ON public.scheduled_posts
  FOR ALL USING (auth.uid() = created_by OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = created_by OR public.is_admin(auth.uid()));

CREATE INDEX idx_scheduled_posts_due ON public.scheduled_posts (publish_at) 
  WHERE status = 'scheduled';

-- Privacy-safe visitor analytics
CREATE TABLE IF NOT EXISTS public.visitor_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz DEFAULT now(),
  path text NOT NULL,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device_type text,
  browser text,
  country text,
  region text,
  ip_hash text, -- SHA-256 hash for privacy
  session_id text,
  user_id uuid, -- if logged in
  page_load_time integer,
  engagement_time integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.visitor_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view analytics" ON public.visitor_analytics
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE INDEX idx_visitor_analytics_occurred_at ON public.visitor_analytics (occurred_at);
CREATE INDEX idx_visitor_analytics_path ON public.visitor_analytics (path);

-- Comprehensive audit log
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id text NOT NULL,
  action text CHECK (action IN ('INSERT','UPDATE','DELETE')) NOT NULL,
  user_id uuid,
  old_values jsonb,
  new_values jsonb,
  changed_fields text[],
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view audit log" ON public.audit_log
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  old_row jsonb := to_jsonb(OLD);
  new_row jsonb := to_jsonb(NEW);
  changed_fields text[];
  key text;
BEGIN
  -- Determine changed fields
  IF TG_OP = 'UPDATE' THEN
    FOR key IN SELECT jsonb_object_keys(new_row) LOOP
      IF old_row->key IS DISTINCT FROM new_row->key THEN
        changed_fields := array_append(changed_fields, key);
      END IF;
    END LOOP;
  END IF;

  INSERT INTO public.audit_log (
    table_name, 
    record_id, 
    action, 
    user_id,
    old_values,
    new_values,
    changed_fields,
    ip_address,
    user_agent
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    TG_OP,
    auth.uid(),
    CASE WHEN TG_OP != 'INSERT' THEN old_row END,
    CASE WHEN TG_OP != 'DELETE' THEN new_row END,
    changed_fields,
    inet(current_setting('request.headers', true)::json->>'x-forwarded-for'),
    current_setting('request.headers', true)::json->>'user-agent'
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply audit triggers to key tables
DROP TRIGGER IF EXISTS audit_articles ON public.articles;
CREATE TRIGGER audit_articles 
  AFTER INSERT OR UPDATE OR DELETE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles 
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- FRED economic data caching
CREATE TABLE IF NOT EXISTS public.fred_series (
  series_id text PRIMARY KEY,
  title text NOT NULL,
  units text,
  frequency text,
  seasonal_adjustment text,
  last_updated timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fred_observations (
  series_id text REFERENCES public.fred_series(series_id) ON DELETE CASCADE,
  date date NOT NULL,
  value numeric,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (series_id, date)
);

ALTER TABLE public.fred_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fred_observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read FRED data" ON public.fred_series FOR SELECT USING (true);
CREATE POLICY "Public read FRED observations" ON public.fred_observations FOR SELECT USING (true);
CREATE POLICY "Admins manage FRED data" ON public.fred_series FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins manage FRED observations" ON public.fred_observations FOR ALL USING (public.is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_fred_observations_date ON public.fred_observations (date DESC);
CREATE INDEX idx_fred_series_updated ON public.fred_series (last_updated);

-- Update existing insights to use cached FRED data
CREATE OR REPLACE FUNCTION public.get_latest_fred_value(p_series_id text)
RETURNS numeric LANGUAGE sql STABLE AS $$
  SELECT value FROM public.fred_observations 
  WHERE series_id = p_series_id 
  ORDER BY date DESC 
  LIMIT 1;
$$;