import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 LinkedIn publish function started');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('📋 CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔐 Starting authentication check');
    
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.log('❌ Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const linkedinAccessToken = Deno.env.get('LINKEDIN_ACCESS_TOKEN');

    console.log('🔍 Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      hasLinkedInToken: !!linkedinAccessToken
    });

    if (!linkedinAccessToken) {
      console.log('❌ LinkedIn access token not configured');
      throw new Error('LinkedIn access token not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.log('❌ Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ User authenticated:', user.email);

    // Check if user has admin role
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasAdminRole = userRoles?.some(role => role.role === 'admin');

    console.log('👤 User roles:', userRoles, 'hasAdmin:', hasAdminRole);

    if (roleError || !hasAdminRole) {
      console.log('❌ Access denied - admin role required');
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📝 Parsing request body');
    const body = await req.json();
    const { content, title, article_url, image_url } = body;

    console.log('📊 Request data:', {
      hasContent: !!content,
      hasTitle: !!title,
      hasArticleUrl: !!article_url,
      hasImageUrl: !!image_url
    });

    if (!content) {
      console.log('❌ Content is required');
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔍 Getting LinkedIn profile');
    // Get LinkedIn person ID
    const profileResponse = await fetch('https://api.linkedin.com/v2/people/~', {
      headers: {
        'Authorization': `Bearer ${linkedinAccessToken}`,
        'LinkedIn-Version': '202405'
      }
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.log('❌ Failed to get LinkedIn profile:', errorText);
      throw new Error(`Failed to get LinkedIn profile: ${profileResponse.status}`);
    }

    const profileData = await profileResponse.json();
    const personId = profileData.id;
    console.log('✅ LinkedIn profile retrieved, person ID:', personId);

    // Prepare the post content
    let postContent = content;
    if (title) {
      postContent = `${title}\n\n${content}`;
    }
    if (article_url) {
      postContent += `\n\nRead more: ${article_url}`;
    }

    console.log('📝 Prepared post content length:', postContent.length);

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

    console.log('🚀 Publishing to LinkedIn');
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
      console.error('❌ LinkedIn publish error:', errorText);
      throw new Error(`Failed to publish to LinkedIn: ${publishResponse.status} - ${errorText}`);
    }

    const publishResult = await publishResponse.json();
    const postId = publishResult.id;
    console.log('✅ Published to LinkedIn, post ID:', postId);

    // Store the published post in our database
    console.log('💾 Storing in database');
    const { error: dbError } = await supabase
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

    if (dbError) {
      console.log('⚠️ Database storage error:', dbError);
      // Don't fail the whole request if database storage fails
    } else {
      console.log('✅ Stored in database successfully');
    }

    console.log('🎉 LinkedIn publish completed successfully');
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Successfully published to LinkedIn',
      post_id: postId,
      post_url: `https://www.linkedin.com/feed/update/urn:li:activity:${postId}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('💥 Error publishing to LinkedIn:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check the edge function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});