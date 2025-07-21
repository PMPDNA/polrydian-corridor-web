import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  console.log("LinkedIn OAuth function called");
  
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    // Get credentials
    const clientId = Deno.env.get("LINKEDIN_CLIENT_ID")!;
    const clientSecret = Deno.env.get("LINKEDIN_CLIENT_SECRET")!;

    // Parse request
    const body = await req.json().catch(() => ({}));
    const { code } = body;

    console.log("Received code:", code ? "present" : "missing");

    if (!code) {
      return jsonResponse({ success: false, error: "Missing authorization code" }, 400);
    }

    // Get the authenticated user ID from the Authorization header
    const authHeader = req.headers.get('authorization');
    let userId = "00000000-0000-0000-0000-000000000000"; // fallback

    if (authHeader) {
      try {
        // Extract the JWT token and decode it to get the user ID
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (user && !error) {
          userId = user.id;
          console.log("Using authenticated user ID:", userId);
        } else {
          console.log("Could not get user from token, using fallback ID");
        }
      } catch (error) {
        console.log("Error getting user from token:", error);
      }
    }

    // Get redirect URI
    const origin = req.headers.get('origin') || 'https://polrydian.com';
    const redirectUri = `${origin}/auth/callback`;
    
    console.log("Using redirect URI:", redirectUri);

    // Exchange code for token
    const tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });

    console.log("Making token request...");

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    console.log("Token response status:", tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      return jsonResponse({
        success: false,
        error: `LinkedIn token exchange failed: ${errorText}`,
        status: tokenResponse.status
      }, 400);
    }

    const tokenData = await tokenResponse.json();
    console.log("Token exchange successful");

    // Get LinkedIn profile
    console.log("Fetching LinkedIn profile...");
    
    const profileResponse = await fetch("https://api.linkedin.com/v2/me", {
      headers: {
        "Authorization": `Bearer ${tokenData.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error("Profile fetch failed:", errorText);
      return jsonResponse({
        success: false,
        error: `LinkedIn profile fetch failed: ${errorText}`
      }, 400);
    }

    const profile = await profileResponse.json();
    console.log("Profile fetched successfully for user:", profile.id);

    // Store credentials in database with the correct user ID
    console.log("Storing credentials for user:", userId);
    
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

    const { error: dbError } = await supabase
      .from("social_media_credentials")
      .upsert({
        user_id: userId,
        platform: "linkedin",
        platform_user_id: profile.id,
        access_token_encrypted: tokenData.access_token,
        refresh_token_encrypted: tokenData.refresh_token || "",
        expires_at: expiresAt,
        profile_data: profile,
        is_active: true
      });

    if (dbError) {
      console.error("Database error:", dbError);
      return jsonResponse({
        success: false,
        error: `Failed to store credentials: ${dbError.message}`
      }, 500);
    }

    console.log("LinkedIn OAuth completed successfully");

    return jsonResponse({
      success: true,
      personId: `urn:li:person:${profile.id}`,
      profile: {
        id: profile.id,
        firstName: profile.localizedFirstName,
        lastName: profile.localizedLastName
      }
    });

  } catch (error) {
    console.error("Error:", error);
    return jsonResponse({ 
      success: false, 
      error: error.message || String(error),
      stack: error.stack
    }, 500);
  }
});

function jsonResponse(obj: any, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}