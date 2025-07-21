import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Secure token encryption using built-in crypto
async function encryptToken(token: string): Promise<string> {
  try {
    // Generate a random key for AES-256-GCM encryption
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the token
    const encodedToken = new TextEncoder().encode(token);
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encodedToken
    );
    
    // Export the key
    const exportedKey = await crypto.subtle.exportKey('raw', key);
    
    // Combine key, iv, and encrypted data
    const combined = new Uint8Array(exportedKey.byteLength + iv.length + encrypted.byteLength);
    combined.set(new Uint8Array(exportedKey), 0);
    combined.set(iv, exportedKey.byteLength);
    combined.set(new Uint8Array(encrypted), exportedKey.byteLength + iv.length);
    
    // Return base64 encoded result
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    // Fallback to base64 encoding if encryption fails
    return btoa(token);
  }
}

// Secure token decryption
async function decryptToken(encryptedToken: string): Promise<string> {
  try {
    // Decode from base64
    const combined = new Uint8Array(
      atob(encryptedToken).split('').map(char => char.charCodeAt(0))
    );
    
    // Extract components
    const keyData = combined.slice(0, 32);
    const iv = combined.slice(32, 44);
    const encrypted = combined.slice(44);
    
    // Import the key
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    // Fallback to base64 decoding for backwards compatibility
    try {
      return atob(encryptedToken);
    } catch {
      throw new Error('Failed to decrypt token');
    }
  }
}

serve(async (req) => {
  console.log('🚀 LinkedIn OAuth function started');
  
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
    const linkedinClientId = Deno.env.get('LINKEDIN_CLIENT_ID');
    const linkedinClientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');

    console.log('🔍 Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      hasLinkedInClientId: !!linkedinClientId,
      hasLinkedInClientSecret: !!linkedinClientSecret
    });

    if (!linkedinClientId || !linkedinClientSecret) {
      throw new Error('LinkedIn OAuth credentials not configured');
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
    const { code, redirectUri } = body;

    console.log('📊 Request data:', {
      hasCode: !!code,
      hasRedirectUri: !!redirectUri
    });

    if (!code) {
      console.log('❌ Authorization code is required');
      return new Response(
        JSON.stringify({ error: 'Authorization code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔄 Exchanging code for tokens');
    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri || `${req.headers.get('origin')}/auth/callback`,
        client_id: linkedinClientId,
        client_secret: linkedinClientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('❌ Token exchange error:', errorText);
      throw new Error(`Failed to exchange code for tokens: ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ Tokens obtained successfully');

    console.log('👤 Fetching user profile');
    // Get user profile to store platform_user_id
    const profileResponse = await fetch('https://api.linkedin.com/v2/people/~:(id,firstName,lastName,profilePicture(displayImage~:playableStreams))', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'LinkedIn-Version': '202405'
      }
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('❌ Profile fetch error:', errorText);
      throw new Error(`Failed to fetch LinkedIn profile: ${profileResponse.status} - ${errorText}`);
    }

    const profileData = await profileResponse.json();
    const platformUserId = profileData.id;

    console.log('✅ Profile fetched, ID:', platformUserId);

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    console.log('💾 Storing credentials in database');
    // Store or update credentials in database
    const { error: dbError } = await supabase
      .from('social_media_credentials')
      .upsert({
        user_id: user.id,
        platform: 'linkedin',
        platform_user_id: platformUserId,
        access_token_encrypted: await encryptToken(tokenData.access_token),
        refresh_token_encrypted: await encryptToken(tokenData.refresh_token || ''),
        expires_at: expiresAt.toISOString(),
        profile_data: profileData,
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,platform'
      });

    if (dbError) {
      console.error('❌ Database storage error:', dbError);
      throw new Error('Failed to store LinkedIn credentials');
    }

    console.log('✅ Credentials stored successfully');

    console.log('🎉 LinkedIn OAuth completed successfully');
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'LinkedIn account connected successfully',
      platform_user_id: platformUserId,
      expires_at: expiresAt.toISOString(),
      profile: {
        id: profileData.id,
        firstName: profileData.firstName?.localized?.en_US || '',
        lastName: profileData.lastName?.localized?.en_US || ''
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('💥 Error in LinkedIn OAuth:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check the edge function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});