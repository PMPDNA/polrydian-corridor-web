import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("LinkedIn OAuth Debug - Request details:");
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    console.log("Origin:", req.headers.get('origin'));
    console.log("Referer:", req.headers.get('referer'));
    
    const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 'https://polrydian.com';
    const redirectUri = `${origin}/auth/callback`;
    
    console.log("Calculated redirect URI:", redirectUri);
    console.log("Client ID:", Deno.env.get("LINKEDIN_CLIENT_ID"));
    console.log("Client Secret exists:", !!Deno.env.get("LINKEDIN_CLIENT_SECRET"));

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      console.log("POST body:", body);
    }

    return new Response(JSON.stringify({
      success: true,
      debug: "Check logs for details"
    }), {
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json" 
      }
    });

  } catch (error) {
    console.error("Debug function error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: String(error)
    }), {
      status: 500,
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json" 
      }
    });
  }
});