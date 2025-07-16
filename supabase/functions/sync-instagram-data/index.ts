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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const instagramAccessToken = Deno.env.get('INSTAGRAM_ACCESS_TOKEN');

    if (!instagramAccessToken) {
      throw new Error('Instagram access token not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

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