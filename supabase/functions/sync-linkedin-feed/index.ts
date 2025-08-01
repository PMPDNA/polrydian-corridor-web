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

// Enhanced IP extraction function for better security logging
function extractClientIP(request: Request): string | null {
  // Get IP from various headers set by reverse proxies
  const headers = [
    'x-forwarded-for',
    'x-real-ip', 
    'cf-connecting-ip',
    'x-client-ip'
  ];
  
  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // Take first IP if comma-separated
      const ip = value.split(',')[0].trim();
      // Basic IP validation
      if (ip && /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}$/.test(ip)) {
        return ip;
      }
    }
  }
  return null;
}

serve(async (req) => {
  console.log('🚀 LinkedIn feed sync started');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Security logging - track who is calling
    const clientIP = extractClientIP(req);
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    console.log('🔐 Request info:', {
      ip: clientIP,
      userAgent: userAgent.substring(0, 50),
      method: req.method
    });

    // ① who is calling me?
    const authHeader = req.headers.get('authorization') ?? 'none';
    console.log('[feed] bearer header:', authHeader.slice(0, 20) + '...');
    
    if (!authHeader || authHeader === 'none') {
      console.warn('🚫 Unauthorized access attempt from:', clientIP);
      return new Response(
        JSON.stringify({ error: 'UNAUTH' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    console.log('[feed] ctx.user:', user?.id ?? null);

    if (authError || !user) {
      console.error('🚫 Auth error:', authError);
      
      // Log failed authentication
      await supabase.from('security_audit_log').insert({
        action: 'failed_authentication',
        ip_address: clientIP,
        user_agent: userAgent,
        details: {
          endpoint: 'sync-linkedin-feed',
          error: authError?.message || 'Invalid token',
          timestamp: new Date().toISOString()
        }
      });
      
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log successful authentication
    await supabase.from('security_audit_log').insert({
      action: 'successful_authentication',
      user_id: user.id,
      ip_address: clientIP,
      user_agent: userAgent,
      details: {
        endpoint: 'sync-linkedin-feed',
        timestamp: new Date().toISOString()
      }
    });

    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasAdminRole = userRoles?.some(role => role.role === 'admin');
    if (!hasAdminRole) {
      console.warn('🚫 Access denied - user lacks admin role:', user.email);
      
      // Log access violation
      await supabase.from('security_audit_log').insert({
        action: 'access_denied',
        user_id: user.id,
        ip_address: clientIP,
        user_agent: userAgent,
        details: {
          endpoint: 'sync-linkedin-feed',
          reason: 'insufficient_permissions',
          required_role: 'admin',
          user_roles: userRoles?.map(r => r.role) || [],
          timestamp: new Date().toISOString()
        }
      });
      
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ② fetch credential row
    const { data: credentials, error: credError } = await supabase
      .from('social_media_credentials')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'linkedin')
      .single();

    console.log('[feed] credential row:', credentials ?? null);

    if (credError || !credentials) {
      console.error('❌ No LinkedIn credentials found for user');
      return new Response(
        JSON.stringify({ error: 'no_credential' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decrypt the access token before use using secure method
    console.log('🔓 Decrypting access token...');
    const accessToken = await decryptTokenSecure(credentials.access_token_encrypted, supabase);
    
    if (!accessToken) {
      throw new Error('Failed to decrypt LinkedIn access token');
    }
    
    const personUrn = `urn:li:person:${credentials.platform_user_id}`;
    const encodedUrn = encodeURIComponent(personUrn);

    console.log('📡 Fetching LinkedIn posts for:', personUrn);
    console.log('📡 Calling LinkedIn REST API posts endpoint with proper format');
    
    const postsResponse = await fetch(
      `https://api.linkedin.com/v2/shares?q=owners&owners=${encodedUrn}&count=20&sortBy=LAST_MODIFIED`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );

    if (!postsResponse.ok) {
      const errorText = await postsResponse.text();
      console.error('LinkedIn error:', postsResponse.status, errorText);
      
      // Log API error with more details
      await supabase.from('security_audit_log').insert({
        action: 'linkedin_api_error',
        user_id: user.id,
        details: {
          status: postsResponse.status,
          error: errorText,
          endpoint: 'posts/shares',
          timestamp: new Date().toISOString(),
          token_permissions_note: 'User may need to re-authorize with updated permissions'
        }
      });
      
      if (postsResponse.status === 401) {
        console.warn('🔄 Token expired, marking credentials as inactive');
        await supabase
          .from('social_media_credentials')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .eq('platform', 'linkedin');
      }
      
      if (postsResponse.status === 403) {
        console.warn('🚫 Insufficient permissions - user needs to re-authorize with updated scopes');
        return new Response(JSON.stringify({ 
          error: 'Insufficient LinkedIn permissions',
          action_required: 'Please disconnect and reconnect your LinkedIn account with updated permissions',
          status: 403
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`LinkedIn API error: ${postsResponse.status}`);
    }

    const postsData = await postsResponse.json();
    let insertedCount = 0;

    console.log('💾 Processing', postsData.results?.length || postsData.elements?.length || 0, 'posts');

    // Handle LinkedIn REST API response format (results array)
    const posts = postsData.results || postsData.elements || [];

    for (const post of posts) {
      try {
        // Extract post data from LinkedIn REST API format
        const postId = post.id || `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const postText = post.commentary?.text || post.content?.commentary?.text || post.text || '';
        const postUrl = `https://www.linkedin.com/feed/update/${postId}`;
        const createdTime = post.createdAt || post.created?.time || Date.now();
        
        // Insert into both tables for compatibility
        const { error: linkedinPostsError } = await supabase
          .from('linkedin_posts')
          .upsert({
            id: postId,
            message: postText,
            post_url: postUrl,
            author: user.email || 'admin',
            created_at: new Date(createdTime).toISOString(),
            updated_at: new Date().toISOString(),
            is_visible: true,
            raw_data: post
          }, { onConflict: 'id' });

        // Also insert into social_media_posts for unified display
        const { error: socialMediaError } = await supabase
          .from('social_media_posts')
          .upsert({
            platform_post_id: postId,
            platform: 'linkedin',
            post_type: 'article',
            title: postText.substring(0, 100) + (postText.length > 100 ? '...' : ''),
            content: postText,
            post_url: postUrl,
            published_at: new Date(createdTime).toISOString(),
            engagement_data: post.socialDetail || {},
            is_visible: true,
            is_featured: (post.socialDetail?.totalShares || 0) > 10,
            approval_status: 'approved'
          }, { onConflict: 'platform_post_id' });

        if (!linkedinPostsError && !socialMediaError) {
          insertedCount++;
          console.log(`✅ Inserted post: ${postId}`);
        } else {
          console.error('Error inserting post:', { linkedinPostsError, socialMediaError });
        }
      } catch (postError) {
        console.error('Error processing individual post:', postError);
      }
    }

    // Log successful sync
    await supabase.from('security_audit_log').insert({
      action: 'linkedin_sync_completed',
      user_id: user.id,
      details: {
        posts_processed: posts.length,
        posts_inserted: insertedCount,
        timestamp: new Date().toISOString()
      }
    });

    console.log('✅ Sync completed:', insertedCount, 'posts inserted');

    return new Response(JSON.stringify({ 
      success: true, 
      inserted: insertedCount,
      total: posts.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('💥 Error:', error);
    
    // Log the error for monitoring
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      await supabase.from('security_audit_log').insert({
        action: 'sync_error',
        details: {
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        }
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});