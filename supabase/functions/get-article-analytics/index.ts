import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
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

    // Get current user to check permissions
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if user is admin
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!userRole) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }), 
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const url = new URL(req.url);
    const articleId = url.searchParams.get('article_id');
    const days = parseInt(url.searchParams.get('days') || '30');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // Get article analytics
    let query = supabase
      .from('article_analytics')
      .select('*')
      .order('total_views', { ascending: false })
      .limit(limit);

    if (articleId) {
      query = query.eq('id', articleId);
    }

    const { data: analytics, error: analyticsError } = await query;

    if (analyticsError) {
      console.error('Error fetching analytics:', analyticsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch analytics' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get view trends for the last N days
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: viewTrends, error: trendsError } = await supabase
      .from('article_views')
      .select(`
        created_at,
        article_id,
        articles!inner(title, slug)
      `)
      .gte('created_at', startDate)
      .order('created_at', { ascending: true });

    if (trendsError) {
      console.error('Error fetching view trends:', trendsError);
    }

    // Get top performing articles summary
    const { data: topArticles, error: topError } = await supabase
      .from('articles')
      .select('id, title, slug, view_count, published_at, category')
      .eq('status', 'published')
      .not('view_count', 'is', null)
      .order('view_count', { ascending: false })
      .limit(10);

    if (topError) {
      console.error('Error fetching top articles:', topError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          analytics: analytics || [],
          view_trends: viewTrends || [],
          top_articles: topArticles || [],
          period_days: days,
          total_articles: analytics?.length || 0
        }
      }), 
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Analytics fetch error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});