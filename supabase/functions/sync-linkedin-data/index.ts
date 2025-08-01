import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';
import { 
  decryptTokenSecure,
  logSecurityEvent 
} from '../_shared/security.ts';

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
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasAdminRole = userRoles?.some(role => role.role === 'admin');

    if (roleError || !hasAdminRole) {
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
      console.log('🔍 Getting LinkedIn credentials from database');
      // Get LinkedIn credentials from database with access token
      const { data: credentials, error: credError } = await supabase
        .from('social_media_credentials')
        .select('*')
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

      // Check if token is expiring soon (within 30 days)
      const expirationDate = new Date(credentials.expires_at);
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const isTokenExpiringSoon = expirationDate < thirtyDaysFromNow;

      if (isTokenExpiringSoon) {
        console.warn('⚠️ LinkedIn token expiring soon:', credentials.expires_at);
        await logSecurityEvent(supabase, 'linkedin_token_expiring', {
          expires_at: credentials.expires_at,
          user_id: user.id
        }, 'medium');
      }

      // Decrypt access token
      const linkedinAccessToken = await decryptTokenSecure(credentials.access_token_encrypted, supabase);
      if (!linkedinAccessToken) {
        throw new Error('Failed to decrypt LinkedIn access token');
      }

      const personId = credentials.platform_user_id;
      console.log('✅ Using LinkedIn person ID from database:', personId);

      // Fetch LinkedIn articles using newer REST API format
      const articlesResponse = await fetch(`https://api.linkedin.com/rest/posts?author=urn:li:person:${personId}&count=20&sortBy=CREATED&sortOrder=DESCENDING`, {
        headers: {
          'Authorization': `Bearer ${linkedinAccessToken}`,
          'LinkedIn-Version': '202507',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      if (!articlesResponse.ok) {
        const errorText = await articlesResponse.text();
        console.error('LinkedIn articles API error:', errorText);
        throw new Error(`Failed to fetch LinkedIn articles: ${articlesResponse.status}`);
      }

      const articlesData = await articlesResponse.json();

      // Process and store articles with engagement data
      for (const article of articlesData.elements || []) {
        // Try to fetch engagement metrics
        let engagement = { numLikes: 0, numComments: 0, numShares: 0, numViews: 0 };
        
        try {
          const engagementResponse = await fetch(`https://api.linkedin.com/v2/socialActions/${article.id}`, {
            headers: {
              'Authorization': `Bearer ${linkedinAccessToken}`,
              'LinkedIn-Version': '202405'
            }
          });

          if (engagementResponse.ok) {
            const engagementData = await engagementResponse.json();
            engagement = {
              numLikes: engagementData.numLikes || 0,
              numComments: engagementData.numComments || 0, 
              numShares: engagementData.numShares || 0,
              numViews: engagementData.numViews || 0
            };
          }
        } catch (engagementError) {
          console.warn('Could not fetch engagement data for article:', article.id);
        }

        await supabase
          .from('linkedin_articles')
          .upsert({
            user_id: user.id,
            linkedin_id: article.id,
            title: article.content?.title || article.commentary?.substring(0, 100) || 'LinkedIn Article',
            content: article.content?.article?.title || article.commentary || '',
            visibility: article.visibility || 'PUBLIC',
            published_at: new Date(article.created.time).toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'linkedin_id'
          });
      }
    }

    if (action === 'sync_posts') {
      console.log('🔍 Getting LinkedIn credentials from database');
      // Get LinkedIn credentials from database with access token
      const { data: credentials, error: credError } = await supabase
        .from('social_media_credentials')
        .select('*')
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

      // Check if token is expiring soon (within 30 days)
      const expirationDate = new Date(credentials.expires_at);
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const isTokenExpiringSoon = expirationDate < thirtyDaysFromNow;

      if (isTokenExpiringSoon) {
        console.warn('⚠️ LinkedIn token expiring soon:', credentials.expires_at);
        await logSecurityEvent(supabase, 'linkedin_token_expiring', {
          expires_at: credentials.expires_at,
          user_id: user.id
        }, 'medium');
      }

      // Decrypt access token
      const linkedinAccessToken = await decryptTokenSecure(credentials.access_token_encrypted, supabase);
      if (!linkedinAccessToken) {
        throw new Error('Failed to decrypt LinkedIn access token');
      }

      const personId = credentials.platform_user_id;
      console.log('✅ Using LinkedIn person ID from database:', personId);

      // Fetch LinkedIn posts using newer REST API format
      const postsResponse = await fetch(`https://api.linkedin.com/rest/posts?author=urn:li:person:${personId}&count=20&sortBy=CREATED&sortOrder=DESCENDING`, {
        headers: {
          'Authorization': `Bearer ${linkedinAccessToken}`,
          'LinkedIn-Version': '202507',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      if (!postsResponse.ok) {
        const errorText = await postsResponse.text();
        console.error('LinkedIn posts API error:', errorText);
        throw new Error(`Failed to fetch LinkedIn posts: ${postsResponse.status}`);
      }

      const postsData = await postsResponse.json();

      // Process and store posts with engagement data
      for (const post of postsData.elements || []) {
        // Try to fetch engagement metrics
        let engagement = { numLikes: 0, numComments: 0, numShares: 0, numViews: 0 };
        
        try {
          const engagementResponse = await fetch(`https://api.linkedin.com/rest/socialActions/${post.id}`, {
            headers: {
              'Authorization': `Bearer ${linkedinAccessToken}`,
              'LinkedIn-Version': '202507',
              'X-Restli-Protocol-Version': '2.0.0'
            }
          });

          if (engagementResponse.ok) {
            const engagementData = await engagementResponse.json();
            engagement = {
              numLikes: engagementData.numLikes || 0,
              numComments: engagementData.numComments || 0,
              numShares: engagementData.numShares || 0,
              numViews: engagementData.numViews || 0
            };
          }
        } catch (engagementError) {
          console.warn('Could not fetch engagement data for post:', post.id);
        }

        await supabase
          .from('social_media_posts')
          .upsert({
            platform: 'linkedin',
            platform_post_id: post.id,
            post_type: 'post',
            title: post.content?.title || '',
            content: post.commentary || '',
            post_url: `https://www.linkedin.com/feed/update/urn:li:activity:${post.id}`,
            published_at: new Date(post.created.time).toISOString(),
            engagement_data: {
              likes: engagement.numLikes,
              comments: engagement.numComments,
              shares: engagement.numShares,
              views: engagement.numViews
            },
            approval_status: 'approved',
            is_visible: true,
            is_featured: engagement.numLikes > 50,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'platform_post_id'
          });
      }
    }

    // Log successful sync
    await logSecurityEvent(supabase, `linkedin_${action}_success`, {
      user_id: user.id,
      action: action
    }, 'low');

    return new Response(JSON.stringify({ 
      success: true, 
      message: `LinkedIn ${action} completed successfully` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error syncing LinkedIn data:', error);
    
    // Log error event
    try {
      await logSecurityEvent(supabase, 'linkedin_sync_error', {
        error: error.message,
        stack: error.stack
      }, 'high');
    } catch (logError) {
      console.error('Failed to log error event:', logError);
    }
    
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});