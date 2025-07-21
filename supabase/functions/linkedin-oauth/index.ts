import { corsHeaders } from "../_shared/cors.ts";

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

    if (!code) {
      return jsonResponse({ success: false, error: "Missing authorization code" }, 400);
    }

    // Get redirect URI
    const origin = req.headers.get('origin') || 'https://polrydian.com';
    const redirectUri = `${origin}/auth/callback`;
    
    console.log("Starting OAuth flow with redirect URI:", redirectUri);

    // Step 1: Exchange code for token
    const tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });

    console.log("Exchanging code for token...");

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", errorText);
      throw new Error(`LinkedIn token exchange failed: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log("Token exchange successful");

    // Step 2: Get LinkedIn profile
    console.log("Fetching LinkedIn profile...");
    
    const profileResponse = await fetch("https://api.linkedin.com/v2/me", {
      headers: {
        "Authorization": `Bearer ${tokenData.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error("Profile fetch failed:", errorText);
      throw new Error(`LinkedIn profile fetch failed: ${errorText}`);
    }

    const profile = await profileResponse.json();
    console.log("Profile fetched successfully for user:", profile.id);

    // Skip database storage for now - just return success
    console.log("LinkedIn OAuth completed successfully (without database storage)");

    return jsonResponse({
      success: true,
      personId: `urn:li:person:${profile.id}`,
      profile: {
        id: profile.id,
        firstName: profile.localizedFirstName,
        lastName: profile.localizedLastName
      },
      message: "OAuth completed - database storage will be added separately"
    });

  } catch (error) {
    console.error("LinkedIn OAuth error:", error);
    return jsonResponse({ 
      success: false, 
      error: error.message || String(error)
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