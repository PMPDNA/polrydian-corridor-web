import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 LinkedIn feed sync started');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ① who is calling me?
    const authHeader = req.headers.get('authorization') ?? 'none';
    console.log('[feed] bearer header:', authHeader.slice(0, 20) + '...');
    
    if (!authHeader || authHeader === 'none') {
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
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasAdminRole = userRoles?.some(role => role.role === 'admin');
    if (!hasAdminRole) {
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
      return new Response(
        JSON.stringify({ error: 'no_credential' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = credentials.access_token_encrypted;
    const personUrn = `urn:li:person:${credentials.platform_user_id}`;

    // Fetch LinkedIn posts using the correct personal endpoint
    const postsResponse = await fetch(
      `https://api.linkedin.com/v2/ugcPosts?q=authors&authors=${encodeURIComponent(personUrn)}&sortBy=LAST_MODIFIED&count=50`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': '202402'
        }
      }
    );

    if (!postsResponse.ok) {
      const errorText = await postsResponse.text();
      console.error('LinkedIn error:', postsResponse.status, errorText);
      
      if (postsResponse.status === 401) {
        await supabase
          .from('social_media_credentials')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .eq('platform', 'linkedin');
      }
      
      throw new Error(`LinkedIn API error: ${postsResponse.status}`);
    }

    const postsData = await postsResponse.json();
    let insertedCount = 0;

    for (const post of postsData.elements || []) {
      const { error: insertError } = await supabase
        .from('linkedin_posts')
        .upsert({
          id: post.id,
          message: post.text?.text || '',
          post_url: `https://www.linkedin.com/feed/update/${post.id}`,
          author: user.email || 'admin',
          created_at: new Date(post.created.time).toISOString(),
          updated_at: new Date().toISOString(),
          is_visible: true,
          raw_data: post
        }, { onConflict: 'id' });

      if (!insertError) insertedCount++;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      inserted: insertedCount,
      total: postsData.elements?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});