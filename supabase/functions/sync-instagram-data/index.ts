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

    // Fetch Instagram media with comprehensive fields
    const mediaResponse = await fetch(`https://graph.instagram.com/me/media?fields=id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,like_count,comments_count,insights.metric(impressions,reach,engagement)&access_token=${instagramAccessToken}`);

    if (!mediaResponse.ok) {
      const errorText = await mediaResponse.text();
      console.error('Instagram API error:', errorText);
      throw new Error(`Failed to fetch Instagram media: ${mediaResponse.status}`);
    }

    const mediaData = await mediaResponse.json();
    let postsProcessed = 0;
    let galleryItemsAdded = 0;

    // Process and store Instagram posts
    for (const media of mediaData.data || []) {
      // Extract hashtags from caption
      const hashtags = media.caption ? 
        media.caption.match(/#[\w]+/g)?.map((tag: string) => tag.slice(1)) || [] : [];

      // Get insights data if available
      const insights = media.insights?.data || [];
      const impressions = insights.find((insight: any) => insight.name === 'impressions')?.values?.[0]?.value || 0;
      const reach = insights.find((insight: any) => insight.name === 'reach')?.values?.[0]?.value || 0;
      const engagement = insights.find((insight: any) => insight.name === 'engagement')?.values?.[0]?.value || 0;

      // Store in social_media_posts table
      await supabase
        .from('social_media_posts')
        .upsert({
          platform: 'instagram',
          platform_post_id: media.id,
          post_type: media.media_type?.toLowerCase() || 'post',
          content: media.caption || '',
          image_url: media.media_url,
          post_url: media.permalink,
          published_at: media.timestamp,
          engagement_data: {
            likes: media.like_count || 0,
            comments: media.comments_count || 0,
            impressions: impressions,
            reach: reach,
            engagement: engagement
          },
          hashtags: hashtags,
          updated_at: new Date().toISOString()
        });

      postsProcessed++;

      // Also add to gallery if it's an image or video
      if (media.media_type === 'IMAGE' || media.media_type === 'VIDEO') {
        await supabase
          .from('gallery')
          .upsert({
            title: media.caption?.substring(0, 100) || `Instagram ${media.media_type}`,
            description: media.caption || '',
            image_url: media.media_url,
            thumbnail_url: media.thumbnail_url || media.media_url,
            category: 'social_media',
            instagram_post_id: media.id,
            is_featured: media.like_count > 100, // Feature posts with high engagement
            is_visible: true,
            updated_at: new Date().toISOString()
          });

        galleryItemsAdded++;
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Instagram data synced successfully',
      posts_synced: postsProcessed,
      gallery_items_added: galleryItemsAdded,
      engagement_tracking: 'enabled'
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