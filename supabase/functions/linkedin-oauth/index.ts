// supabase/functions/linkedin-oauth/index.ts
//--------------------------------------------------------------
//  Secrets you must set in Supabase:
//    LINKEDIN_CLIENT_ID
//    LINKEDIN_CLIENT_SECRET
//    SUPABASE_URL
//    SUPABASE_SERVICE_ROLE_KEY
//--------------------------------------------------------------

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const CLIENT_ID     = Deno.env.get("LINKEDIN_CLIENT_ID")!;
const CLIENT_SECRET = Deno.env.get("LINKEDIN_CLIENT_SECRET")!

/* ---------- helper ------------------------------------------------------- */
async function upsertToken({
  userId,
  personUrn,
  access,
  refresh,
  expiresIn
}: {
  userId: string;
  personUrn: string;
  access: string;
  refresh?: string;
  expiresIn: number;
}) {
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  const { error } = await supabase
    .from("social_media_credentials")
    .upsert({
      user_id: userId,
      platform: "linkedin",
      platform_user_id: personUrn,
      access_token_encrypted: access,       // encrypt in prod
      refresh_token_encrypted: refresh ?? "",
      expires_at: expiresAt
    });

  if (error) throw error;
}
/* ------------------------------------------------------------------------ */

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url  = new URL(req.url);
  const code = url.searchParams.get("code");
  
  // Determine redirect URI from request origin
  const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 'https://polrydian.com';
  const redirectUri = `${origin}/auth/callback`;

  // ───────────────────────────────────────────────────────────── GET (browser redirect)
  if (req.method === "GET" && code) {
    try {
      const token = await exchangeCodeForToken(code, redirectUri);
      const me    = await fetchMe(token.access_token);
      const urn   = `urn:li:person:${me.id}`;

      // unauthenticated for now – use "service" user uuid
      await upsertToken({
        userId: "00000000-0000-0000-0000-000000000000",
        personUrn: urn,
        access: token.access_token,
        refresh: token.refresh_token,
        expiresIn: token.expires_in
      });

      return json({ success: true, personId: urn });
    } catch (e) {
      console.error("LinkedIn OAuth error (GET):", e);
      return json({ success: false, error: String(e) }, 500);
    }
  }

  // ───────────────────────────────────────────────────────────── POST (front-end fetch)
  if (req.method === "POST") {
    const body = await req.json().catch(() => ({}));
    if (!body.code) return json({ success:false, error:"Missing code" }, 400);

    try {
      const token = await exchangeCodeForToken(body.code, redirectUri);
      const me    = await fetchMe(token.access_token);
      const urn   = `urn:li:person:${me.id}`;

      // in POST we may have a logged-in session header
      const userId =
        req.headers.get("x-user-uuid") ?? // custom header you can send
        "00000000-0000-0000-0000-000000000000";

      await upsertToken({
        userId,
        personUrn: urn,
        access: token.access_token,
        refresh: token.refresh_token,
        expiresIn: token.expires_in
      });

      return json({ success: true, personId: urn });
    } catch (e) {
      console.error("LinkedIn OAuth error (POST):", e);
      return json({ success: false, error: String(e) }, 500);
    }
  }

  // Anything else
  return new Response("Not found", { status: 404 });
}); // <<—— the missing closing bracket you hit before

/* ---------- helpers ----------------------------------------------------- */
async function exchangeCodeForToken(code: string, redirectUri: string) {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  });

  const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`LinkedIn token exchange failed: ${txt}`);
  }
  return res.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  }>;
}

async function fetchMe(access: string) {
  const res = await fetch("https://api.linkedin.com/v2/me", {
    headers: { Authorization: `Bearer ${access}` }
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`LinkedIn profile test failed: ${txt}`);
  }
  return res.json() as Promise<{ id: string }>;
}

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 
      ...corsHeaders,
      "Content-Type": "application/json" 
    }
  });
}