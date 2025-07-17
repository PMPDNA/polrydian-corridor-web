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
    const instagramAccessToken = Deno.env.get('INSTAGRAM_ACCESS_TOKEN');

    if (!instagramAccessToken) {
      throw new Error('Instagram access token not configured');
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
        identifier_value: `instagram_sync_${clientIP}`,
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

    // Fetch Instagram media for @miamistoic
    const mediaResponse = await fetch(`https://graph.instagram.com/me/media?fields=id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,like_count,comments_count&access_token=${instagramAccessToken}`);

    if (!mediaResponse.ok) {
      throw new Error('Failed to fetch Instagram media');
    }

    const mediaData = await mediaResponse.json();

    // Process and store Instagram posts
    for (const media of mediaData.data || []) {
      // Extract hashtags from caption
      const hashtags = media.caption ? 
        media.caption.match(/#[\w]+/g)?.map((tag: string) => tag.slice(1)) || [] : [];

      await supabase
        .from('social_media_posts')
        .upsert({
          platform: 'instagram',
          platform_post_id: media.id,
          post_type: 'post',
          content: media.caption || '',
          image_url: media.media_url,
          post_url: media.permalink,
          published_at: media.timestamp,
          engagement_data: {
            likes: media.like_count || 0,
            comments: media.comments_count || 0
          },
          hashtags: hashtags,
        });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Instagram data synced successfully',
      posts_synced: mediaData.data?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error syncing Instagram data:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});