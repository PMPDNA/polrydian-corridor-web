import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://polrydian.com',
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

    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const { data: rateCheck, error: rateLimitError } = await supabase
      .rpc('check_rate_limit', {
        identifier_value: `upload_${clientIP}`,
        max_attempts: 10,
        window_minutes: 60
      });

    if (rateLimitError || !rateCheck) {
      console.log('Rate limit exceeded');
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string || 'general';
    const instagramPostId = formData.get('instagram_post_id') as string;

    if (!file) {
      throw new Error('No file provided');
    }

    // File validation
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (file.size > maxFileSize) {
      return new Response(
        JSON.stringify({ error: 'File size exceeds 10MB limit' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Only images are allowed.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `gallery/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('mobile-uploads')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('mobile-uploads')
      .getPublicUrl(filePath);

    // Create thumbnail URL (you might want to implement actual thumbnail generation)
    const thumbnailUrl = publicUrl; // For now, use same URL

    // Save to gallery table
    const { data: galleryItem, error: dbError } = await supabase
      .from('gallery')
      .insert({
        title: title || file.name,
        description,
        image_url: publicUrl,
        thumbnail_url: thumbnailUrl,
        category,
        instagram_post_id: instagramPostId,
        uploaded_by: user.id // Use authenticated user's ID
      })
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      galleryItem,
      message: 'Photo uploaded successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error uploading mobile photo:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});