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
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin role
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasAdminRole = userRoles?.some(role => role.role === 'admin');

    if (roleError || !hasAdminRole) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { caption, image_url, article_url } = body;

    if (!caption && !image_url) {
      return new Response(
        JSON.stringify({ error: 'Either caption or image is required for Instagram posts' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Instagram user ID
    const userResponse = await fetch(`https://graph.instagram.com/me?access_token=${instagramAccessToken}`);
    
    if (!userResponse.ok) {
      throw new Error('Failed to get Instagram user info');
    }

    const userData = await userResponse.json();
    const instagramUserId = userData.id;

    let finalCaption = caption || '';
    if (article_url) {
      finalCaption += `\n\nRead more: ${article_url}`;
    }

    let mediaId = null;

    if (image_url) {
      // Step 1: Create media container
      const containerResponse = await fetch(`https://graph.instagram.com/${instagramUserId}/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          image_url: image_url,
          caption: finalCaption,
          access_token: instagramAccessToken
        })
      });

      if (!containerResponse.ok) {
        const errorText = await containerResponse.text();
        console.error('Instagram container creation error:', errorText);
        throw new Error(`Failed to create Instagram media container: ${containerResponse.status}`);
      }

      const containerResult = await containerResponse.json();
      const containerId = containerResult.id;

      // Step 2: Publish the media
      const publishResponse = await fetch(`https://graph.instagram.com/${instagramUserId}/media_publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          creation_id: containerId,
          access_token: instagramAccessToken
        })
      });

      if (!publishResponse.ok) {
        const errorText = await publishResponse.text();
        console.error('Instagram publish error:', errorText);
        throw new Error(`Failed to publish Instagram media: ${publishResponse.status}`);
      }

      const publishResult = await publishResponse.json();
      mediaId = publishResult.id;
    } else {
      // For text-only posts, Instagram requires using the Media endpoint differently
      // Note: Instagram doesn't support text-only posts through the API
      // This would need to be handled differently, perhaps by creating a text image
      throw new Error('Instagram requires an image for posts. Text-only posts are not supported via API.');
    }

    // Store the published post in our database
    await supabase
      .from('social_media_posts')
      .insert({
        platform: 'instagram',
        platform_post_id: mediaId,
        post_type: 'published_post',
        content: finalCaption,
        image_url: image_url || null,
        post_url: `https://www.instagram.com/p/${mediaId}`, // This is a simplified URL
        published_at: new Date().toISOString(),
        engagement_data: {},
        approval_status: 'approved',
        is_visible: true,
        is_featured: false
      });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Successfully published to Instagram',
      media_id: mediaId,
      note: 'Instagram post published successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error publishing to Instagram:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});