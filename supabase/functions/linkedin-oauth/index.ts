import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  console.log("=== LinkedIn OAuth function called ===");
  
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  try {
    // Get credentials
    const clientId = Deno.env.get("LINKEDIN_CLIENT_ID");
    const clientSecret = Deno.env.get("LINKEDIN_CLIENT_SECRET");

    console.log("Environment check:");
    console.log("- Client ID exists:", !!clientId);
    console.log("- Client Secret exists:", !!clientSecret);

    if (!clientId || !clientSecret) {
      console.error("Missing LinkedIn credentials");
      return jsonResponse({ 
        success: false, 
        error: "LinkedIn credentials not configured properly" 
      }, 500);
    }

    // Parse request
    const body = await req.json().catch(() => ({}));
    const { code } = body;

    console.log("Request parsing:");
    console.log("- Code received:", !!code);
    console.log("- Code length:", code ? code.length : 0);

    if (!code) {
      console.error("No authorization code provided");
      return jsonResponse({ 
        success: false, 
        error: "Missing authorization code. Please try the LinkedIn authorization again." 
      }, 400);
    }

    // Get user ID from auth header
    const authHeader = req.headers.get('authorization');
    let userId = "00000000-0000-0000-0000-000000000000";

    console.log("Auth header check:");
    console.log("- Auth header exists:", !!authHeader);

    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (user && !error) {
          userId = user.id;
          console.log("- User ID extracted:", userId);
        } else {
          console.log("- Auth error:", error?.message);
        }
      } catch (error) {
        console.log("- Auth extraction error:", error);
      }
    }

    // Get redirect URI
    const origin = req.headers.get('origin') || 'https://polrydian.com';
    const redirectUri = `${origin}/auth/callback`;
    
    console.log("OAuth setup:");
    console.log("- Origin:", origin);
    console.log("- Redirect URI:", redirectUri);
    console.log("- Client ID:", clientId);

    // Exchange code for token
    const tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });

    console.log("Making LinkedIn token request...");

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    console.log("Token response:", tokenResponse.status, tokenResponse.statusText);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("LinkedIn token exchange failed:", errorText);
      
      // Parse LinkedIn error for better user feedback
      let userMessage = "LinkedIn authorization failed. Please try connecting again.";
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error_description) {
          userMessage = errorJson.error_description;
        }
      } catch (e) {
        // Use raw error text if not JSON
        userMessage = errorText;
      }

      return jsonResponse({
        success: false,
        error: userMessage,
        details: errorText,
        status: tokenResponse.status
      }, 400);
    }

    const tokenData = await tokenResponse.json();
    console.log("Token exchange successful, expires in:", tokenData.expires_in);

    // Get LinkedIn profile
    console.log("Fetching LinkedIn profile...");
    
    const profileResponse = await fetch("https://api.linkedin.com/v2/me", {
      headers: {
        "Authorization": `Bearer ${tokenData.access_token}`,
      },
    });

    console.log("Profile response:", profileResponse.status);

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error("Profile fetch failed:", errorText);
      return jsonResponse({
        success: false,
        error: "Failed to fetch LinkedIn profile. Please try again.",
        details: errorText
      }, 400);
    }

    const profile = await profileResponse.json();
    console.log("Profile fetched for:", profile.localizedFirstName, profile.localizedLastName);

    // Store credentials
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
        error: "Failed to save LinkedIn connection. Please try again.",
        details: dbError.message
      }, 500);
    }

    console.log("=== LinkedIn OAuth completed successfully ===");

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
    console.error("=== Unexpected error ===:", error);
    return jsonResponse({ 
      success: false, 
      error: "An unexpected error occurred. Please try again.",
      details: error.message,
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