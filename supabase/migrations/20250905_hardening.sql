-- BEGIN: Schema checks (safe guards)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ========== Example tables, tweak names if different ==========
-- profiles, articles, conversations, visitor_analytics, user_roles

-- ======= Indexes (common query patterns) =======

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (lower(email));
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON public.profiles (updated_at DESC);

-- articles
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles (slug);

-- conversations
CREATE INDEX IF NOT EXISTS idx_conversations_user_ts ON public.conversations (user_id, created_at DESC);

-- visitor_analytics
CREATE INDEX IF NOT EXISTS idx_va_session_ts ON public.visitor_analytics (session_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_va_path_ts ON public.visitor_analytics (path, ts DESC);

-- user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role ON public.user_roles (user_id, role);

-- ======= Row Level Security =======

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- helper: current user id by JWT
CREATE OR REPLACE FUNCTION public.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::json->>'sub', '')::uuid
$$;

-- PROFILES
DROP POLICY IF EXISTS "profiles_owner_rw" ON public.profiles;
CREATE POLICY "profiles_owner_rw"
ON public.profiles
FOR ALL
USING (id = public.uid())
WITH CHECK (id = public.uid());

-- ARTICLES
DROP POLICY IF EXISTS "articles_public_read" ON public.articles;
CREATE POLICY "articles_public_read"
ON public.articles
FOR SELECT
USING (published = true);

DROP POLICY IF EXISTS "articles_owner_rw" ON public.articles;
CREATE POLICY "articles_owner_rw"
ON public.articles
FOR ALL
USING (author_id = public.uid())
WITH CHECK (author_id = public.uid());

-- CONVERSATIONS (per-user privacy)
DROP POLICY IF EXISTS "conversations_owner_rw" ON public.conversations;
CREATE POLICY "conversations_owner_rw"
ON public.conversations
FOR ALL
USING (user_id = public.uid())
WITH CHECK (user_id = public.uid());

-- VISITOR ANALYTICS (write-only by backend service role; no public reads)
DROP POLICY IF EXISTS "va_service_insert" ON public.visitor_analytics;
CREATE POLICY "va_service_insert"
ON public.visitor_analytics
FOR INSERT
TO authenticated
WITH CHECK (true);  -- tighten if you separate service role

DROP POLICY IF EXISTS "va_no_public_read" ON public.visitor_analytics;
CREATE POLICY "va_no_public_read"
ON public.visitor_analytics
FOR SELECT
USING (false); -- nobody via client; use service/admin only

-- USER ROLES (admin-only)
DROP POLICY IF EXISTS "user_roles_admin" ON public.user_roles;
CREATE POLICY "user_roles_admin"
ON public.user_roles
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur2
  WHERE ur2.user_id = public.uid() AND ur2.role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles ur2
  WHERE ur2.user_id = public.uid() AND ur2.role = 'admin'
));
