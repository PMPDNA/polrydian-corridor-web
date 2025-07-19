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
    const { content, title, article_url, image_url } = body;

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get LinkedIn person ID
    const profileResponse = await fetch('https://api.linkedin.com/v2/people/~', {
      headers: {
        'Authorization': `Bearer ${linkedinAccessToken}`,
        'LinkedIn-Version': '202405'
      }
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to get LinkedIn profile');
    }

    const profileData = await profileResponse.json();
    const personId = profileData.id;

    // Prepare the post content
    let postContent = content;
    if (title) {
      postContent = `${title}\n\n${content}`;
    }
    if (article_url) {
      postContent += `\n\nRead more: ${article_url}`;
    }

    // Create LinkedIn post
    const postData = {
      "author": `urn:li:person:${personId}`,
      "commentary": postContent,
      "visibility": "PUBLIC",
      "distribution": {
        "feedDistribution": "MAIN_FEED",
        "targetEntities": [],
        "thirdPartyDistributionChannels": []
      },
      "lifecycleState": "PUBLISHED",
      "isReshareDisabledByAuthor": false
    };

    // Add image if provided
    if (image_url) {
      // For now, we'll include the image URL in the commentary
      // Full image upload would require additional LinkedIn API calls
      postData.commentary += `\n\nImage: ${image_url}`;
    }

    const publishResponse = await fetch('https://api.linkedin.com/v2/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${linkedinAccessToken}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': '202405'
      },
      body: JSON.stringify(postData)
    });

    if (!publishResponse.ok) {
      const errorText = await publishResponse.text();
      console.error('LinkedIn publish error:', errorText);
      throw new Error(`Failed to publish to LinkedIn: ${publishResponse.status}`);
    }

    const publishResult = await publishResponse.json();
    const postId = publishResult.id;

    // Store the published post in our database
    await supabase
      .from('social_media_posts')
      .insert({
        platform: 'linkedin',
        platform_post_id: postId,
        post_type: 'published_post',
        title: title || '',
        content: content,
        image_url: image_url || null,
        post_url: `https://www.linkedin.com/feed/update/urn:li:activity:${postId}`,
        published_at: new Date().toISOString(),
        engagement_data: {},
        approval_status: 'approved',
        is_visible: true,
        is_featured: false
      });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Successfully published to LinkedIn',
      post_id: postId,
      post_url: `https://www.linkedin.com/feed/update/urn:li:activity:${postId}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error publishing to LinkedIn:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});