import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  console.log("Simple LinkedIn OAuth function called");
  
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    console.log("Headers:", Object.fromEntries(req.headers.entries()));

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      console.log("Body:", body);
      
      return new Response(JSON.stringify({
        success: true,
        message: "LinkedIn OAuth function is working",
        receivedCode: !!body.code,
        timestamp: new Date().toISOString()
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    return new Response("Method not allowed", { status: 405 });

  } catch (error) {
    console.error("Error in LinkedIn OAuth:", error);
    return new Response(JSON.stringify({
      success: false,
      error: String(error),
      stack: error.stack
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});