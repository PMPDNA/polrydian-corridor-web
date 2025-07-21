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
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only handle POST requests
  if (req.method !== "POST") {
    return json({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    // Get the code from request body
    const body = await req.json().catch(() => ({}));
    const { code } = body;

    if (!code) {
      return json({ success: false, error: "Missing authorization code" }, 400);
    }

    console.log("Processing LinkedIn OAuth with code:", code);

    // Determine redirect URI from request origin
    const origin = req.headers.get('origin') || 'https://polrydian.com';
    const redirectUri = `${origin}/auth/callback`;
    
    console.log("Using redirect URI:", redirectUri);

    // Exchange code for access token
    const tokenResponse = await exchangeCodeForToken(code, redirectUri);
    console.log("Got token response");

    // Get user info from LinkedIn
    const userInfo = await getLinkedInProfile(tokenResponse.access_token);
    console.log("Got user info:", userInfo);

    // Store credentials in database
    await storeLinkedInCredentials({
      platformUserId: userInfo.id,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresIn: tokenResponse.expires_in,
      profileData: userInfo
    });

    console.log("Successfully stored LinkedIn credentials");

    return json({
      success: true,
      personId: `urn:li:person:${userInfo.id}`,
      profile: userInfo
    });

  } catch (error) {
    console.error("LinkedIn OAuth error:", error);
    return json({ 
      success: false, 
      error: String(error)
    }, 500);
  }
});

// Exchange authorization code for access token
async function exchangeCodeForToken(code: string, redirectUri: string) {
  const tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
  
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: LINKEDIN_CLIENT_ID,
    client_secret: LINKEDIN_CLIENT_SECRET,
  });

  console.log("Token exchange params:", {
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    client_id: LINKEDIN_CLIENT_ID,
    client_secret: "***",
    code: code.substring(0, 20) + "..."
  });

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

// Get LinkedIn profile information
async function getLinkedInProfile(accessToken: string) {
  const profileUrl = "https://api.linkedin.com/v2/me";
  
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

// Store LinkedIn credentials in database
async function storeLinkedInCredentials({
  platformUserId,
  accessToken,
  refreshToken,
  expiresIn,
  profileData
}: {
  platformUserId: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  profileData: any;
}) {
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  const { error } = await supabase
    .from("social_media_credentials")
    .upsert({
      user_id: "00000000-0000-0000-0000-000000000000", // Default for now
      platform: "linkedin",
      platform_user_id: platformUserId,
      access_token_encrypted: accessToken, // TODO: Encrypt in production
      refresh_token_encrypted: refreshToken || "",
      expires_at: expiresAt,
      profile_data: profileData,
      is_active: true
    });

  if (error) {
    console.error("Database error:", error);
    throw new Error(`Failed to store credentials: ${error.message}`);
  }
}

// Helper function to return JSON responses
function json(obj: any, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}