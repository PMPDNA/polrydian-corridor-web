import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Use secure token decryption
async function decryptTokenSecure(encryptedToken: string, supabase: any): Promise<string> {
  try {
    const { data, error } = await supabase.rpc('decrypt_token_secure', {
      encrypted_token: encryptedToken
    });
    
    if (error) {
      console.error('Token decryption error:', error);
      throw new Error('Failed to decrypt token');
    }
    
    return data;
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
}

serve(async (req) => {
  console.log('🚀 LinkedIn share function started');
  
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

    console.log('🔍 Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey
    });

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
    const { articleId, title, content, message } = body;

    console.log('📊 Request data:', {
      hasArticleId: !!articleId,
      hasTitle: !!title,
      hasContent: !!content,
      hasMessage: !!message
    });

    if (!content && !message) {
      console.log('❌ Content or message is required');
      return new Response(
        JSON.stringify({ error: 'Content or message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔍 Getting LinkedIn credentials from database');
    // Get LinkedIn credentials from database
    const { data: credentials, error: credError } = await supabase
      .from('social_media_credentials')
      .select('platform_user_id, access_token_encrypted, refresh_token_encrypted, expires_at, is_active')
      .eq('user_id', user.id)
      .eq('platform', 'linkedin')
      .eq('is_active', true)
      .single();

    if (credError || !credentials) {
      console.error('❌ LinkedIn credentials not found in database:', credError);
      return new Response(
        JSON.stringify({ 
          error: 'LinkedIn credentials not configured. Please set up your LinkedIn integration first.',
          setup_required: true
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const personId = credentials.platform_user_id;
    
    // Decrypt token securely
    const accessToken = await decryptTokenSecure(credentials.access_token_encrypted, supabase);
    
    console.log('✅ Using LinkedIn person ID from database:', personId);
    console.log('🔐 Access token available:', !!accessToken);

    // Check if token needs refresh and attempt refresh if needed
    const now = new Date();
    const expiresAt = new Date(credentials.expires_at);
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

    if (expiresAt <= tenMinutesFromNow) {
      console.log('🔄 Token expires soon, attempting refresh...');
      try {
        await supabase.functions.invoke('token-refresh-cron');
        console.log('✅ Token refresh triggered');
      } catch (refreshError) {
        console.warn('⚠️ Token refresh failed, continuing with current token:', refreshError);
      }
    }

    // Prepare the post content
    let postContent = message || content;
    if (title && !message) {
      postContent = `${title}\n\n${content}`;
    }

    // Add article URL if provided and it's a proper URL
    if (articleId) {
      const baseUrl = req.headers.get('origin') || 'https://polrydian.com';
      const articleUrl = `${baseUrl}/articles/${articleId}`;
      postContent += `\n\nRead more: ${articleUrl}`;
    }

    console.log('📝 Prepared post content length:', postContent.length);

    // Create LinkedIn post using the new REST API format
    const shareData = {
      "author": `urn:li:person:${personId}`,
      "commentary": postContent,
      "visibility": "PUBLIC",
      "distribution": {
        "feedDistribution": "MAIN_FEED",
        "targetEntities": [],
        "thirdPartyDistributionChannels": []
      }
    };

    console.log('🚀 Sharing to LinkedIn using REST API');
    const shareResponse = await fetch('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': '202507',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(shareData)
    });

    if (!shareResponse.ok) {
      const errorText = await shareResponse.text();
      console.error('❌ LinkedIn share error:', errorText);
      
      // If 401, mark credentials as inactive
      if (shareResponse.status === 401) {
        await supabase
          .from('social_media_credentials')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .eq('platform', 'linkedin');
      }
      
      throw new Error(`Failed to share to LinkedIn: ${shareResponse.status} - ${errorText}`);
    }

    const shareResult = await shareResponse.json();
    const shareId = shareResult.id;
    console.log('✅ Shared to LinkedIn, share ID:', shareId);

    // Store the shared post in our database and outbound shares tracking
    console.log('💾 Storing in database');
    
    // First store in social_media_posts
    const { error: dbError } = await supabase
      .from('social_media_posts')
      .insert({
        platform: 'linkedin',
        platform_post_id: shareId,
        post_type: 'shared_article',
        title: title || '',
        content: postContent,
        post_url: `https://www.linkedin.com/feed/update/${shareId}`,
        published_at: new Date().toISOString(),
        engagement_data: {},
        approval_status: 'approved',
        is_visible: true,
        is_featured: false
      });

    // Then store in outbound_shares for tracking
    const { error: shareError } = await supabase
      .from('outbound_shares')
      .insert({
        user_id: user.id,
        article_id: articleId || null,
        post_urn: shareId,
        status: 'success'
      });

    if (dbError) {
      console.log('⚠️ Database storage error:', dbError);
      // Don't fail the whole request if database storage fails
    } else {
      console.log('✅ Stored in social_media_posts successfully');
    }

    if (shareError) {
      console.log('⚠️ Outbound share tracking error:', shareError);
    } else {
      console.log('✅ Stored in outbound_shares successfully');
    }

    console.log('🎉 LinkedIn share completed successfully');
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Successfully shared to LinkedIn',
      post_id: shareId,
      post_url: `https://www.linkedin.com/feed/update/${shareId}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('💥 Error sharing to LinkedIn:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check the edge function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});