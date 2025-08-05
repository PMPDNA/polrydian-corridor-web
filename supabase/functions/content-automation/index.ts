import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const newsApiKey = Deno.env.get('NEWS_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { operation } = await req.json();
    
    switch (operation) {
      case 'generate_scheduled_article':
        return await generateScheduledArticle();
      case 'generate_monthly_summary':
        return await generateMonthlySummary();
      case 'check_breaking_news':
        return await checkBreakingNews();
      default:
        throw new Error('Invalid operation');
    }
  } catch (error) {
    console.error('Error in content automation:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateScheduledArticle() {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Generate article content about current affairs in corridor economics
  const prompt = `Write a strategic analysis article (800-1200 words) about current global affairs that impact corridor economics, supply chain resilience, and geopolitical trade routes. Focus on recent developments in the past week. Include specific data points, actionable insights, and implications for international business. Structure: Introduction, Current Situation Analysis, Strategic Implications, Actionable Recommendations. Write in Patrick Misiewicz's analytical style.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are Patrick Misiewicz, a strategic advisor specializing in corridor economics and geopolitical analysis. Write authoritative, data-driven content.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;

  // Generate title
  const titleResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: `Generate a compelling, professional title for this strategic analysis article:\n\n${content.substring(0, 300)}...` }
      ],
      temperature: 0.5,
      max_tokens: 100,
    }),
  });

  const titleData = await titleResponse.json();
  const title = titleData.choices[0].message.content.replace(/['"]/g, '');

  // Save to database
  const { data: article, error } = await supabase
    .from('articles')
    .insert({
      title,
      content,
      meta_description: content.substring(0, 160) + '...',
      status: 'published',
      published_at: new Date().toISOString(),
      keywords: ['Strategy', 'Current Affairs', 'Automated'],
      reading_time_minutes: Math.ceil(content.length / 1200),
    })
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ 
    success: true, 
    article: { id: article.id, title },
    message: 'Scheduled article generated and published'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function generateMonthlySummary() {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Get last month's articles for context
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const { data: recentArticles } = await supabase
    .from('articles')
    .select('title, meta_description, created_at')
    .gte('created_at', oneMonthAgo.toISOString())
    .eq('status', 'published')
    .limit(10);

  const articlesContext = recentArticles?.map(a => `${a.title}: ${a.meta_description}`).join('\n') || '';

  const prompt = `Create a comprehensive monthly summary article analyzing major trends in corridor economics, global trade, and geopolitical developments. Include statistical data, emerging patterns, and strategic forecasts. Reference these recent topics we've covered: ${articlesContext}. Format as a professional 1500-word strategic briefing with data-driven insights and actionable intelligence for business leaders.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are Patrick Misiewicz writing a monthly strategic briefing. Include specific statistics, trend analysis, and forward-looking insights.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 2500,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;

  const title = `Strategic Monthly Briefing: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Corridor Economics Outlook`;

  const { data: article, error } = await supabase
    .from('articles')
    .insert({
      title,
      content,
      meta_description: `Monthly strategic analysis of global corridor economics trends, trade developments, and geopolitical impacts for ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.`,
      status: 'published',
      published_at: new Date().toISOString(),
      keywords: ['Strategy', 'Monthly Summary', 'Trends'],
      reading_time_minutes: Math.ceil(content.length / 1200),
      featured_image: '/corridor-economics-diagram.jpg',
    })
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ 
    success: true, 
    article: { id: article.id, title },
    message: 'Monthly summary generated and published'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function checkBreakingNews() {
  if (!newsApiKey) {
    console.log('News API key not configured, skipping breaking news check');
    return new Response(JSON.stringify({ message: 'News API not configured' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Monitor for corridor-relevant breaking news
  const keywords = [
    'suez canal', 'panama canal', 'belt and road', 'brics currency', 
    'supply chain disruption', 'trade war', 'sanctions', 'infrastructure',
    'shipping crisis', 'port strikes', 'energy corridor'
  ];

  const query = keywords.join(' OR ');
  
  const newsResponse = await fetch(
    `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=5&apiKey=${newsApiKey}`
  );
  
  const newsData = await newsResponse.json();
  
  if (newsData.articles && newsData.articles.length > 0) {
    // Check if we've already covered this story
    const recentTitles = newsData.articles.map((article: any) => article.title);
    
    const { data: existingArticles } = await supabase
      .from('articles')
      .select('title')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const isNewStory = !existingArticles?.some(existing => 
      recentTitles.some(newsTitle => 
        newsTitle.toLowerCase().includes(existing.title.toLowerCase().split(' ')[0])
      )
    );

    if (isNewStory && openAIApiKey) {
      const topStory = newsData.articles[0];
      
      const analysisPrompt = `Analyze this breaking news from a corridor economics perspective: "${topStory.title}" - ${topStory.description}. Write a 600-800 word strategic analysis focusing on implications for global trade routes, supply chains, and economic corridors. Include actionable insights for business leaders.`;

      const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are Patrick Misiewicz providing urgent strategic analysis of breaking news events.' },
            { role: 'user', content: analysisPrompt }
          ],
          temperature: 0.8,
          max_tokens: 1500,
        }),
      });

      const analysisData = await analysisResponse.json();
      const analysis = analysisData.choices[0].message.content;

      const title = `Breaking Analysis: ${topStory.title.substring(0, 80)}...`;

      const { data: article, error } = await supabase
        .from('articles')
        .insert({
          title,
          content: analysis,
          meta_description: `Urgent strategic analysis: ${topStory.description?.substring(0, 140)}...`,
          status: 'published',
          published_at: new Date().toISOString(),
          keywords: ['Breaking News', 'Urgent Analysis', 'Strategy'],
          reading_time_minutes: Math.ceil(analysis.length / 1200),
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ 
        success: true, 
        article: { id: article.id, title },
        message: 'Breaking news analysis generated',
        breakingNews: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify({ message: 'No significant breaking news detected' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}