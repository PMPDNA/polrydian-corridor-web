import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LinkedInPostData {
  token: string;
  content: string;
  imageUrl?: string;
  articleUrl?: string;
}

async function postToLinkedIn({ token, content, imageUrl, articleUrl }: LinkedInPostData) {
  try {
    console.log('Posting to LinkedIn...');
    
    // Get user profile to get the person URN
    const profileResponse = await fetch('https://api.linkedin.com/v2/people/~', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!profileResponse.ok) {
      throw new Error(`LinkedIn profile fetch failed: ${profileResponse.status}`);
    }

    const profile = await profileResponse.json();
    const authorUrn = profile.id;

    // Prepare post data
    const postData: any = {
      author: `urn:li:person:${authorUrn}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    // Add media if image URL is provided
    if (imageUrl) {
      postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE';
      postData.specificContent['com.linkedin.ugc.ShareContent'].media = [{
        status: 'READY',
        media: imageUrl,
        title: {
          text: 'Shared Image'
        }
      }];
    }

    // Add article link if provided
    if (articleUrl) {
      postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'ARTICLE';
      postData.specificContent['com.linkedin.ugc.ShareContent'].media = [{
        status: 'READY',
        originalUrl: articleUrl
      }];
    }

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LinkedIn API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('LinkedIn post created:', result.id);
    
    return { 
      success: true, 
      id: result.id,
      url: `https://linkedin.com/posts/${result.id}` 
    };

  } catch (error) {
    console.error('LinkedIn post error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get scheduled posts that are due
    const { data: duePosts, error: fetchError } = await supabase
      .from("scheduled_posts")
      .select("id, channel, body, image_url, article_url, created_by, title")
      .eq("status", "scheduled")
      .lte("publish_at", new Date().toISOString())
      .limit(20);

    if (fetchError) {
      console.error('Error fetching due posts:', fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!duePosts || duePosts.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No posts due for publishing',
        processed: 0 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${duePosts.length} posts due for publishing`);

    let processed = 0;
    const results = [];

    for (const post of duePosts) {
      try {
        console.log(`Processing post ${post.id} for ${post.channel}`);

        // Get social account credentials
        const { data: account, error: accountError } = await supabase
          .from("social_accounts")
          .select("access_token_encrypted, provider")
          .eq("user_id", post.created_by)
          .eq("provider", post.channel)
          .eq("is_active", true)
          .maybeSingle();

        if (accountError || !account) {
          console.log(`No active ${post.channel} account for user ${post.created_by}`);
          
          await supabase
            .from("scheduled_posts")
            .update({ 
              status: "failed",
              error_message: `No active ${post.channel} account found`,
              updated_at: new Date().toISOString()
            })
            .eq("id", post.id);
          
          results.push({ 
            id: post.id, 
            status: 'failed', 
            error: `No active ${post.channel} account` 
          });
          continue;
        }

        // Decrypt token (simplified - in production, use proper decryption)
        const token = account.access_token_encrypted;

        let publishResult;
        if (post.channel === 'linkedin') {
          publishResult = await postToLinkedIn({
            token,
            content: post.body,
            imageUrl: post.image_url,
            articleUrl: post.article_url
          });
        } else {
          // Instagram publishing would go here
          publishResult = { 
            success: false, 
            error: 'Instagram publishing not yet implemented' 
          };
        }

        // Update post status based on result
        if (publishResult.success) {
          await supabase
            .from("scheduled_posts")
            .update({ 
              status: "sent",
              platform_post_id: publishResult.id,
              updated_at: new Date().toISOString()
            })
            .eq("id", post.id);
          
          results.push({ 
            id: post.id, 
            status: 'sent', 
            platform_id: publishResult.id 
          });
          processed++;
        } else {
          await supabase
            .from("scheduled_posts")
            .update({ 
              status: "failed",
              error_message: publishResult.error,
              updated_at: new Date().toISOString()
            })
            .eq("id", post.id);
          
          results.push({ 
            id: post.id, 
            status: 'failed', 
            error: publishResult.error 
          });
        }

        // Small delay between posts to be respectful to APIs
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error processing post ${post.id}:`, error);
        
        await supabase
          .from("scheduled_posts")
          .update({ 
            status: "failed",
            error_message: error.message,
            updated_at: new Date().toISOString()
          })
          .eq("id", post.id);

        results.push({ 
          id: post.id, 
          status: 'failed', 
          error: error.message 
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed,
      total: duePosts.length,
      results,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Social publishing error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});