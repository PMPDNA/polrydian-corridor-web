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

    console.log("Received code:", code ? "present" : "missing");

    if (!code) {
      return jsonResponse({ success: false, error: "Missing authorization code" }, 400);
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
    console.log("Token exchange successful, access token length:", tokenData.access_token?.length || 0);

    // Just return the token exchange success for now
    return jsonResponse({
      success: true,
      message: "Token exchange completed successfully",
      hasAccessToken: !!tokenData.access_token,
      expiresIn: tokenData.expires_in
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