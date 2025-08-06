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
    console.log('🔍 Economic Intelligence Search function started');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { query, sources = [] } = await req.json();

    if (!query || query.trim().length < 3) {
      throw new Error('Query must be at least 3 characters long');
    }

    console.log(`🔍 Searching for: "${query}" with sources: ${sources.join(', ')}`);

    // Construct search query with domain filtering
    let searchQuery = query;
    if (sources.length > 0) {
      const domainFilter = sources.map(source => `site:${source}`).join(' OR ');
      searchQuery = `${query} (${domainFilter})`;
    }

    // Call Perplexity API for economic intelligence
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: `You are an expert economic intelligence analyst specializing in corridor economics, trade policy, and geopolitical developments. Provide comprehensive, strategic analysis with specific data points and actionable insights. Focus on current developments and their implications for global trade corridors, supply chain resilience, and economic security.`
          },
          {
            role: 'user',
            content: searchQuery
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 2000,
        return_images: false,
        return_related_questions: true,
        search_domain_filter: sources.length > 0 ? sources : ['csis.org', 'piie.com', 'brookings.edu', 'cfr.org'],
        search_recency_filter: 'month',
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    if (!perplexityResponse.ok) {
      throw new Error(`Perplexity API error: ${perplexityResponse.status}`);
    }

    const perplexityData = await perplexityResponse.json();
    const content = perplexityData.choices[0]?.message?.content || '';
    const relatedQuestions = perplexityData.choices[0]?.message?.related_questions || [];

    // Extract sources from citations in the response
    const extractedSources: string[] = [];
    const citationRegex = /\[(https?:\/\/[^\]]+)\]/g;
    let match;
    while ((match = citationRegex.exec(content)) !== null) {
      extractedSources.push(match[1]);
    }

    console.log(`✅ Generated response with ${extractedSources.length} sources and ${relatedQuestions.length} related questions`);

    return new Response(JSON.stringify({
      content: content,
      sources: [...new Set(extractedSources)], // Remove duplicates
      relatedQuestions: relatedQuestions.slice(0, 5), // Limit to 5 questions
      searchQuery: searchQuery,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ Error in search-economic-intelligence function:', error);
    
    let errorMessage = 'Failed to search economic intelligence';
    let statusCode = 500;

    if (error.message?.includes('PERPLEXITY_API_KEY')) {
      errorMessage = 'Perplexity API key not configured';
      statusCode = 503;
    } else if (error.message?.includes('Query must be')) {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.message?.includes('rate limit')) {
      errorMessage = 'Rate limit exceeded. Please wait before trying again.';
      statusCode = 429;
    }

    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error.message
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});