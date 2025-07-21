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
    // Step 1: Check environment variables
    const clientId = Deno.env.get("LINKEDIN_CLIENT_ID");
    const clientSecret = Deno.env.get("LINKEDIN_CLIENT_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("Environment check:");
    console.log("- Client ID:", clientId ? "present" : "missing");
    console.log("- Client Secret:", clientSecret ? "present" : "missing");
    console.log("- Supabase URL:", supabaseUrl ? "present" : "missing");
    console.log("- Supabase Key:", supabaseKey ? "present" : "missing");

    if (!clientId || !clientSecret) {
      throw new Error("LinkedIn credentials not configured");
    }

    // Step 2: Parse request body
    const body = await req.json().catch(() => ({}));
    const { code } = body;

    console.log("Request body parsed, code:", code ? "present" : "missing");

    if (!code) {
      return jsonResponse({ success: false, error: "Missing authorization code" }, 400);
    }

    // Step 3: Determine redirect URI
    const origin = req.headers.get('origin') || 'https://polrydian.com';
    const redirectUri = `${origin}/auth/callback`;
    
    console.log("Redirect URI:", redirectUri);

    // Step 4: Try token exchange
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
      throw new Error(`LinkedIn token exchange failed: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log("Token exchange successful");

    return jsonResponse({
      success: true,
      message: "Token exchange completed",
      hasAccessToken: !!tokenData.access_token
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