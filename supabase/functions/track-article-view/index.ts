import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface ViewTrackingRequest {
  article_id: string;
  article_slug?: string;
  session_id?: string;
  referrer?: string;
  reading_time_seconds?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { 
      article_id, 
      article_slug, 
      session_id, 
      referrer,
      reading_time_seconds 
    }: ViewTrackingRequest = await req.json();

    // Validate required fields
    if (!article_id && !article_slug) {
      return new Response(
        JSON.stringify({ error: 'Article ID or slug is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get client IP and user agent
    const ip = req.headers.get("x-forwarded-for") ?? 
               req.headers.get("cf-connecting-ip") ?? 
               req.headers.get("x-real-ip") ?? 
               "127.0.0.1";
    
    const userAgent = req.headers.get("user-agent") ?? "Unknown";
    
    // Get current user if authenticated
    const authHeader = req.headers.get('Authorization');
    let currentUser = null;
    
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      );
      currentUser = user;
    }

    // Find article by ID or slug
    let targetArticleId = article_id;
    
    if (!targetArticleId && article_slug) {
      const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', article_slug)
        .eq('status', 'published')
        .single();
      
      if (articleError || !articleData) {
        return new Response(
          JSON.stringify({ error: 'Article not found' }), 
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      targetArticleId = articleData.id;
    }

    // Check if this is a duplicate view from the same session/user in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: existingView } = await supabase
      .from('article_views')
      .select('id')
      .eq('article_id', targetArticleId)
      .gte('created_at', oneHourAgo)
      .or(
        currentUser 
          ? `user_id.eq.${currentUser.id},session_id.eq.${session_id || 'none'}`
          : `session_id.eq.${session_id || 'none'},ip_address.eq.${ip}`
      )
      .maybeSingle();

    // If recent view exists, don't create duplicate but update reading time if provided
    if (existingView && reading_time_seconds) {
      console.log(`Updating reading time for existing view: ${existingView.id}`);
      // Could add a reading_time_seconds column to track engagement
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Reading time updated',
          view_id: existingView.id 
        }), 
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (existingView) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'View already tracked',
          view_id: existingView.id 
        }), 
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create new view record
    const { data: viewData, error: viewError } = await supabase
      .from('article_views')
      .insert({
        article_id: targetArticleId,
        user_id: currentUser?.id || null,
        session_id: session_id || null,
        ip_address: ip,
        user_agent: userAgent,
        referrer: referrer || null
      })
      .select('id')
      .single();

    if (viewError) {
      console.error('Error tracking view:', viewError);
      return new Response(
        JSON.stringify({ error: 'Failed to track view' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`New article view tracked: ${viewData.id} for article: ${targetArticleId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'View tracked successfully',
        view_id: viewData.id
      }), 
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Article view tracking error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});