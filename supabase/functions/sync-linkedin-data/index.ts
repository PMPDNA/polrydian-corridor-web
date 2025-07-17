import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.log('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const linkedinAccessToken = Deno.env.get('LINKEDIN_ACCESS_TOKEN');

    if (!linkedinAccessToken) {
      throw new Error('LinkedIn access token not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.log('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin role
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || userRole?.role !== 'admin') {
      console.log('Access denied - admin role required');
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const { data: rateCheck, error: rateLimitError } = await supabase
      .rpc('check_rate_limit', {
        identifier_value: `linkedin_sync_${clientIP}`,
        max_attempts: 5,
        window_minutes: 60
      });

    if (rateLimitError || !rateCheck) {
      console.log('Rate limit exceeded');
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { action = 'sync_posts' } = body;

    // Input validation
    if (typeof action !== 'string' || !['sync_posts', 'sync_articles'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'sync_articles') {
      // Fetch LinkedIn articles
      const articlesResponse = await fetch('https://api.linkedin.com/v2/shares?q=owners&owners=urn:li:person:PERSON_ID&projection=(elements*(id,activity,created,lastModified,text,content,commentary))', {
        headers: {
          'Authorization': `Bearer ${linkedinAccessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      if (!articlesResponse.ok) {
        throw new Error('Failed to fetch LinkedIn articles');
      }

      const articlesData = await articlesResponse.json();

      // Process and store articles
      for (const article of articlesData.elements || []) {
        await supabase
          .from('linkedin_articles')
          .upsert({
            linkedin_article_id: article.id,
            title: article.content?.title || 'LinkedIn Article',
            content: article.text?.text || '',
            summary: article.commentary || '',
            published_at: new Date(article.created.time).toISOString(),
            article_url: `https://www.linkedin.com/posts/activity-${article.activity}`,
          });
      }
    }

    if (action === 'sync_posts') {
      // Fetch LinkedIn posts
      const postsResponse = await fetch('https://api.linkedin.com/v2/shares?q=owners&owners=urn:li:person:PERSON_ID', {
        headers: {
          'Authorization': `Bearer ${linkedinAccessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      if (!postsResponse.ok) {
        throw new Error('Failed to fetch LinkedIn posts');
      }

      const postsData = await postsResponse.json();

      // Process and store posts
      for (const post of postsData.elements || []) {
        await supabase
          .from('social_media_posts')
          .upsert({
            platform: 'linkedin',
            platform_post_id: post.id,
            post_type: 'post',
            title: post.content?.title || '',
            content: post.text?.text || '',
            post_url: `https://www.linkedin.com/posts/activity-${post.activity}`,
            published_at: new Date(post.created.time).toISOString(),
          });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `LinkedIn ${action} completed successfully` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error syncing LinkedIn data:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});