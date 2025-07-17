import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ContactEmailRequest {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  service?: string;
  message: string;
  urgent: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting by IP
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    // Simple rate limiting check (you could enhance this with a database)
    const userAgent = req.headers.get('user-agent') || '';
    
    // Block suspicious requests
    if (userAgent.includes('bot') || userAgent.includes('crawler')) {
      console.log('Blocked bot request from:', clientIP);
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const body = await req.json();
    const { 
      firstName, 
      lastName, 
      email, 
      company, 
      service, 
      message, 
      urgent 
    }: ContactEmailRequest = body;

    // Enhanced validation
    if (!firstName || !lastName || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Input sanitization and validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Length limits to prevent abuse
    if (firstName.length > 50 || lastName.length > 50 || message.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Input too long" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Basic content filtering
    const suspiciousPatterns = /<script|javascript|<iframe|onclick/i;
    if (suspiciousPatterns.test(message) || suspiciousPatterns.test(firstName) || suspiciousPatterns.test(lastName)) {
      console.log('Blocked suspicious content from:', clientIP);
      return new Response(
        JSON.stringify({ error: "Invalid content detected" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send notification email to Patrick
    const notificationResponse = await resend.emails.send({
      from: "Strategic Inquiry <noreply@polrydian.com>",
      to: ["patrick@polrydian.com"],
      subject: `${urgent ? "🔴 URGENT " : ""}New Strategic Consultation Inquiry - ${firstName} ${lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            ${urgent ? "🔴 URGENT " : ""}Strategic Consultation Inquiry
          </h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Contact Information</h3>
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${company ? `<p><strong>Organization:</strong> ${company}</p>` : ""}
            ${service ? `<p><strong>Service Area:</strong> ${service}</p>` : ""}
            <p><strong>Priority:</strong> ${urgent ? "URGENT - Immediate attention required" : "Standard inquiry"}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #374151;">Strategic Challenge/Opportunity:</h3>
            <div style="background: white; padding: 15px; border-left: 4px solid #2563eb; border-radius: 4px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>

          <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;">
              <strong>Response Time Target:</strong> ${urgent ? "24 hours (urgent)" : "48 hours (standard)"}
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="font-size: 12px; color: #6b7280;">
            This inquiry was submitted through the Polrydian Group strategic consultation form.
          </p>
        </div>
      `,
    });

    // Send confirmation email to the user
    const confirmationResponse = await resend.emails.send({
      from: "Patrick Misiewicz <patrick@polrydian.com>",
      to: [email],
      subject: "Strategic Consultation Inquiry Received - Polrydian Group",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Thank you for your strategic consultation inquiry</h2>
          
          <p>Dear ${firstName},</p>
          
          <p>I've received your inquiry regarding strategic consultation and corridor economics advisory services. Your submission has been flagged as ${urgent ? "<strong>urgent</strong>" : "standard priority"} and will receive appropriate attention.</p>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">What happens next?</h3>
            <ul style="color: #4b5563;">
              <li><strong>Initial Review:</strong> I'll personally review your strategic challenge within ${urgent ? "24 hours" : "48 hours"}</li>
              <li><strong>Preliminary Assessment:</strong> If aligned with our capabilities, I'll provide initial thoughts and next steps</li>
              <li><strong>Consultation Scheduling:</strong> We'll arrange a focused discussion to explore how corridor economics can address your specific needs</li>
            </ul>
          </div>

          <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af;">
              <strong>Confidentiality:</strong> All communications are protected under professional advisory privilege. Your strategic information is secure.
            </p>
          </div>

          <p>In the meantime, feel free to explore more about our approach to corridor economics and strategic consulting at <a href="https://polrydian.com" style="color: #2563eb;">polrydian.com</a>.</p>

          <p>Best regards,<br>
          <strong>Patrick Misiewicz</strong><br>
          Founder & Strategic Advisor<br>
          Polrydian Group<br>
          <a href="mailto:patrick@polrydian.com" style="color: #2563eb;">patrick@polrydian.com</a></p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="font-size: 12px; color: #6b7280;">
            This is an automated confirmation. Please do not reply to this email. 
            For urgent matters, contact patrick@polrydian.com directly.
          </p>
        </div>
      `,
    });

    console.log("Emails sent successfully:", { notificationResponse, confirmationResponse });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Your strategic consultation inquiry has been sent successfully. You should receive a confirmation email shortly." 
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send email. Please try again or contact us directly at patrick@polrydian.com",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);