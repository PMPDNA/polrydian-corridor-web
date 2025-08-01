import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';
import { extractClientIP, validateInput, checkRateLimit, logSecurityEvent, getCombinedHeaders } from '../_shared/security.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-csrf-token",
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
  csrfToken: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract client information for security logging
    const clientIP = extractClientIP(req);
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Enhanced rate limiting and bot detection
    if (!checkRateLimit(clientIP, 5, 60)) { // 5 requests per minute
      await logSecurityEvent(supabase, 'rate_limit_exceeded', {
        ip: clientIP,
        user_agent: userAgent,
        endpoint: 'send-contact-email'
      }, 'medium');
      
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests. Please try again later.' 
        }),
        { 
          status: 429, 
          headers: getCombinedHeaders()
        }
      );
    }

    // Enhanced bot detection
    const botPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i,
      /curl/i, /wget/i, /python/i, /requests/i
    ];
    
    if (botPatterns.some(pattern => pattern.test(userAgent))) {
      await logSecurityEvent(supabase, 'bot_blocked', {
        ip: clientIP,
        user_agent: userAgent
      }, 'low');
      
      return new Response(
        JSON.stringify({ error: 'Automated requests not allowed' }),
        { status: 403, headers: getCombinedHeaders() }
      );
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: getCombinedHeaders() }
      );
    }

    const requestData = await req.json() as ContactEmailRequest;

    // Enhanced input validation with CSRF protection
    const validation = validateInput(requestData, [
      'firstName', 'lastName', 'email', 'message', 'csrfToken'
    ]);

    if (!validation.isValid) {
      await logSecurityEvent(supabase, 'invalid_input', {
        ip: clientIP,
        errors: validation.errors
      }, 'medium');
      
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input data', 
          details: validation.errors 
        }),
        { status: 400, headers: getCombinedHeaders() }
      );
    }

    const sanitizedData = validation.sanitizedData;

    // Enhanced email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(sanitizedData.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: getCombinedHeaders() }
      );
    }

    // Content length validation
    if (sanitizedData.message.length > 5000) {
      return new Response(
        JSON.stringify({ error: 'Message too long. Maximum 5000 characters.' }),
        { status: 400, headers: getCombinedHeaders() }
      );
    }

    // Check for suspicious content patterns
    const suspiciousPatterns = [
      /<script/i, /javascript:/i, /onclick/i, /onerror/i,
      /viagra/i, /casino/i, /bitcoin/i, /crypto/i,
      /http:\/\//g, /https:\/\//g
    ];

    const messageContent = sanitizedData.message.toLowerCase();
    const suspiciousCount = suspiciousPatterns.reduce((count, pattern) => {
      const matches = messageContent.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);

    if (suspiciousCount > 2) {
      await logSecurityEvent(supabase, 'suspicious_content', {
        ip: clientIP,
        suspicious_patterns: suspiciousCount,
        message_preview: sanitizedData.message.substring(0, 100)
      }, 'high');
      
      return new Response(
        JSON.stringify({ error: 'Message contains suspicious content' }),
        { status: 400, headers: getCombinedHeaders() }
      );
    }

    // Send notification email to Patrick
    const notificationResponse = await resend.emails.send({
      from: "Strategic Inquiry <noreply@polrydian.com>",
      to: ["patrick@polrydian.com"],
      subject: `${sanitizedData.urgent ? "🔴 URGENT " : ""}New Strategic Consultation Inquiry - ${sanitizedData.firstName} ${sanitizedData.lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            ${sanitizedData.urgent ? "🔴 URGENT " : ""}Strategic Consultation Inquiry
          </h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Contact Information</h3>
            <p><strong>Name:</strong> ${sanitizedData.firstName} ${sanitizedData.lastName}</p>
            <p><strong>Email:</strong> ${sanitizedData.email}</p>
            ${sanitizedData.company ? `<p><strong>Organization:</strong> ${sanitizedData.company}</p>` : ""}
            ${sanitizedData.service ? `<p><strong>Service Area:</strong> ${sanitizedData.service}</p>` : ""}
            <p><strong>Priority:</strong> ${sanitizedData.urgent ? "URGENT - Immediate attention required" : "Standard inquiry"}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #374151;">Strategic Challenge/Opportunity:</h3>
            <div style="background: white; padding: 15px; border-left: 4px solid #2563eb; border-radius: 4px;">
              ${sanitizedData.message.replace(/\n/g, '<br>')}
            </div>
          </div>

          <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;">
              <strong>Response Time Target:</strong> ${sanitizedData.urgent ? "24 hours (urgent)" : "48 hours (standard)"}
            </p>
          </div>

          <div style="margin-top: 20px; padding: 15px; background: #e9ecef; border-radius: 8px; font-size: 12px; color: #6c757d;">
            <p>Submitted: ${new Date().toLocaleString()}</p>
            <p>IP Address: ${clientIP}</p>
            <p>User Agent: ${userAgent}</p>
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
      to: [sanitizedData.email],
      subject: "Strategic Consultation Inquiry Received - Polrydian Group",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Thank you for your strategic consultation inquiry</h2>
          
          <p>Dear ${sanitizedData.firstName},</p>
          
          <p>I've received your inquiry regarding strategic consultation and corridor economics advisory services. Your submission has been flagged as ${sanitizedData.urgent ? "<strong>urgent</strong>" : "standard priority"} and will receive appropriate attention.</p>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">What happens next?</h3>
            <ul style="color: #4b5563;">
              <li><strong>Initial Review:</strong> I'll personally review your strategic challenge within ${sanitizedData.urgent ? "24 hours" : "48 hours"}</li>
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

    // Send both emails and handle results
    const [notificationResult, confirmationResult] = await Promise.allSettled([
      notificationResponse,
      confirmationResponse
    ]);

    // Log successful contact form submission
    await logSecurityEvent(supabase, 'contact_form_success', {
      ip: clientIP,
      email: sanitizedData.email,
      company: sanitizedData.company,
      urgent: sanitizedData.urgent
    }, 'low');

    // Check results and provide appropriate response
    const notificationSuccess = notificationResult.status === 'fulfilled' && !notificationResult.value.error;
    const confirmationSuccess = confirmationResult.status === 'fulfilled' && !confirmationResult.value.error;

    if (notificationSuccess && confirmationSuccess) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Your strategic consultation inquiry has been sent successfully. You should receive a confirmation email shortly." 
        }), 
        {
          status: 200,
          headers: getCombinedHeaders(),
        }
      );
    } else {
      // Log partial failure
      await logSecurityEvent(supabase, 'email_partial_failure', {
        notification_success: notificationSuccess,
        confirmation_success: confirmationSuccess,
        notification_error: notificationResult.status === 'rejected' ? notificationResult.reason : null,
        confirmation_error: confirmationResult.status === 'rejected' ? confirmationResult.reason : null
      }, 'medium');

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Your message was received, but there was an issue with email delivery. We\'ll still get back to you.' 
        }),
        { 
          status: 200, 
          headers: getCombinedHeaders()
        }
      );
    }
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    
    // Log error for security monitoring
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      await logSecurityEvent(supabase, 'contact_form_error', {
        error: error.message,
        stack: error.stack
      }, 'high');
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to send email. Please try again or contact us directly at patrick@polrydian.com"
      }),
      {
        status: 500,
        headers: getCombinedHeaders(),
      }
    );
  }
};

serve(handler);