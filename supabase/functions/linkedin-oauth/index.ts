// supabase/functions/linkedin-oauth/index.ts
// -------------------------------------------
// ENV you must define in Supabase      (Settings ▸ Secrets)
// LINKEDIN_CLIENT_ID        e.g. "86abcxyz123"
// LINKEDIN_CLIENT_SECRET    e.g. "p0q9r8s7t6u5…"
// -------------------------------------------

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";       // shared CORS helper

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// tiny helper – encrypt token with Supabase built-in pgcrypto (or swap for KMS)
async function storeToken(
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
  personUrn: string
) {
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  const { error } = await supabase
    .from("social_media_credentials")
    .upsert({
      user_id: userId,
      platform: "linkedin",
      access_token_encrypted: accessToken,   // <- swap for encrypted string in prod
      refresh_token_encrypted: refreshToken,
      expires_at: expiresAt,
      platform_user_id: personUrn
    });

  if (error) throw error;
}

Deno.serve(async (req) => {
  // CORS (if needed)
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Handle GET request - just return HTML to close the popup
    if (req.method === "GET") {
      return new Response(
        '<html><body><script>window.close();</script><p>You may close this tab.</p></body></html>',
        { headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    // Handle POST request - actual OAuth processing
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const authCode = body.code;
    const state = body.state;

    if (!authCode) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing code parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1️⃣ exchange code → access_token
    console.log('Exchanging authorization code for access token...');
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code: authCode,
      redirect_uri: "https://polrydian.com/auth/callback",
      client_id: Deno.env.get("LINKEDIN_CLIENT_ID")!,
      client_secret: Deno.env.get("LINKEDIN_CLIENT_SECRET")!
    });

    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error('Token exchange failed:', err);
      return new Response(
        JSON.stringify({ success: false, error: "Token exchange failed", detail: err }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenJson: {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    } = await tokenRes.json();
    console.log('Token exchange successful, expires in:', tokenJson.expires_in);

    // 2️⃣ pull user's person URN (needed for publishing)
    const meRes = await fetch("https://api.linkedin.com/v2/me", {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` }
    });
    
    if (!meRes.ok) {
      const err = await meRes.text();
      console.error('Profile fetch failed:', err);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to fetch LinkedIn profile", detail: err }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const meJson = await meRes.json();         // → { id: "abc123", localizedFirstName:… }
    const personUrn = `urn:li:person:${meJson.id}`;
    console.log('LinkedIn profile fetched for person:', personUrn);

    // 3️⃣ store in DB (we use anon user 00000000-0000-0000-0000-000000000000 for now)
    await storeToken(
      "00000000-0000-0000-0000-000000000000",  // <- replace with auth.uid() if session attached
      tokenJson.access_token,
      tokenJson.refresh_token ?? "",
      tokenJson.expires_in,
      personUrn
    );
    console.log('Credentials stored successfully in database');

    // 4️⃣ return JSON the front-end expects
    const body = {
      success: true,
      personId: personUrn,
      expiresIn: tokenJson.expires_in
    };

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('LinkedIn OAuth error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'OAuth process failed' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});