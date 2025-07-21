import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  console.log("Test function called");
  
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      console.log("Body:", body);
      
      // Test the environment variables
      const clientId = Deno.env.get("LINKEDIN_CLIENT_ID");
      const clientSecret = Deno.env.get("LINKEDIN_CLIENT_SECRET");
      
      console.log("Client ID:", clientId);
      console.log("Client Secret exists:", !!clientSecret);
      
      return new Response(JSON.stringify({
        success: true,
        clientId,
        hasClientSecret: !!clientSecret,
        body
      }), {
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        }
      });
    }
    
    return new Response("Method not allowed", { status: 405 });
    
  } catch (error) {
    console.error("Test function error:", error);
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