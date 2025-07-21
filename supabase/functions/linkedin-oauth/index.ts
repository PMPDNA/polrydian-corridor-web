import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// LinkedIn OAuth configuration
const LINKEDIN_CLIENT_ID = Deno.env.get("LINKEDIN_CLIENT_ID")!;
const LINKEDIN_CLIENT_SECRET = Deno.env.get("LINKEDIN_CLIENT_SECRET")!;

Deno.serve(async (req) => {
  console.log("LinkedIn OAuth function called");
  
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    // Get the code from request body
    const body = await req.json().catch(() => ({}));
    const { code } = body;

    console.log("Received code:", code ? "present" : "missing");

    if (!code) {
      return jsonResponse({ success: false, error: "Missing authorization code" }, 400);
    }

    // Determine redirect URI from request origin
    const origin = req.headers.get('origin') || 'https://polrydian.com';
    const redirectUri = `${origin}/auth/callback`;
    
    console.log("Using redirect URI:", redirectUri);
    console.log("Client ID:", LINKEDIN_CLIENT_ID);
    console.log("Client Secret exists:", !!LINKEDIN_CLIENT_SECRET);

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code, redirectUri);
    console.log("Token exchange successful");

    // Get user profile
    const profile = await getLinkedInProfile(tokenData.access_token);
    console.log("Profile fetched:", profile.id);

    // Store in database
    await storeCredentials(profile.id, tokenData, profile);
    console.log("Credentials stored");

    return jsonResponse({
      success: true,
      personId: `urn:li:person:${profile.id}`,
      profile: profile
    });

  } catch (error) {
    console.error("LinkedIn OAuth error:", error);
    return jsonResponse({ 
      success: false, 
      error: error.message || String(error)
    }, 500);
  }
});

async function exchangeCodeForToken(code: string, redirectUri: string) {
  const tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
  
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: LINKEDIN_CLIENT_ID,
    client_secret: LINKEDIN_CLIENT_SECRET,
  });

  console.log("Making token request to LinkedIn...");

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Token exchange failed:", errorText);
    throw new Error(`LinkedIn token exchange failed: ${errorText}`);
  }

  return await response.json();
}

async function getLinkedInProfile(accessToken: string) {
  const profileUrl = "https://api.linkedin.com/v2/me";
  
  console.log("Fetching LinkedIn profile...");

  const response = await fetch(profileUrl, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Profile fetch failed:", errorText);
    throw new Error(`LinkedIn profile fetch failed: ${errorText}`);
  }

  return await response.json();
}

async function storeCredentials(platformUserId: string, tokenData: any, profile: any) {
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

  console.log("Storing credentials in database...");

  const { error } = await supabase
    .from("social_media_credentials")
    .upsert({
      user_id: "00000000-0000-0000-0000-000000000000",
      platform: "linkedin",
      platform_user_id: platformUserId,
      access_token_encrypted: tokenData.access_token,
      refresh_token_encrypted: tokenData.refresh_token || "",
      expires_at: expiresAt,
      profile_data: profile,
      is_active: true
    });

  if (error) {
    console.error("Database error:", error);
    throw new Error(`Failed to store credentials: ${error.message}`);
  }
}

function jsonResponse(obj: any, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}