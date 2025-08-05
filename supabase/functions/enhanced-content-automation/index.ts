import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// News sources and keywords for corridor economics monitoring
const CORRIDOR_KEYWORDS = [
  'Suez Canal', 'Belt and Road', 'BRICS', 'supply chain', 'trade corridor',
  'maritime chokepoint', 'infrastructure investment', 'shipping route',
  'trade war', 'geopolitical tension', 'economic sanctions'
]

const THINK_TANK_SOURCES = [
  {
    name: 'CSIS',
    rss: 'https://www.csis.org/feeds/analysis.xml',
    keywords: ['corridor', 'infrastructure', 'geopolitics', 'trade']
  },
  {
    name: 'Brookings',
    rss: 'https://www.brookings.edu/feed/',
    keywords: ['economics', 'global', 'policy', 'trade']
  },
  {
    name: 'OECD',
    rss: 'https://www.oecd.org/newsroom/rss/oecd-news.xml',
    keywords: ['economic outlook', 'trade', 'infrastructure']
  }
]

const generateArticleWithAI = async (prompt: string, openaiKey: string) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a strategic consultant specializing in corridor economics. Write professional, insightful articles that analyze global economic and geopolitical trends through the lens of strategic flows and corridor dynamics. Your writing should be sophisticated, data-driven, and actionable for business leaders and policymakers.

Corridor Economics Framework:
- Strategic flows of capital, technology, and expertise between regions
- Geopolitical friction points that create opportunities
- Infrastructure investments that reshape global trade patterns
- Risk assessment and strategic positioning

Writing Style:
- Professional and authoritative tone
- Data-driven analysis with specific examples
- Strategic implications and recommendations
- Clear structure with compelling headlines
- 800-1200 words for standard articles
- Include relevant statistics and trends when available`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

const fetchRSSFeed = async (url: string) => {
  try {
    const response = await fetch(url)
    if (!response.ok) return []
    
    const xmlText = await response.text()
    // Simple XML parsing for RSS items
    const items = xmlText.match(/<item>[\s\S]*?<\/item>/g) || []
    
    return items.slice(0, 5).map(item => {
      const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/)
      const linkMatch = item.match(/<link>(.*?)<\/link>/)
      const descMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/)
      
      return {
        title: titleMatch ? (titleMatch[1] || titleMatch[2]) : '',
        link: linkMatch ? linkMatch[1] : '',
        description: descMatch ? (descMatch[1] || descMatch[2]) : ''
      }
    })
  } catch (error) {
    console.error(`Error fetching RSS from ${url}:`, error)
    return []
  }
}

const createCuratedArticle = async (supabase: any, openaiKey: string) => {
  // Fetch recent FRED data for context
  const { data: fredData } = await supabase
    .from('insights')
    .select('title, data_points, indicator_type, updated_at')
    .eq('data_source', 'FRED')
    .eq('is_published', true)
    .order('updated_at', { ascending: false })
    .limit(5)

  // Fetch recent think tank articles
  const thinkTankArticles = []
  for (const source of THINK_TANK_SOURCES) {
    const articles = await fetchRSSFeed(source.rss)
    thinkTankArticles.push(...articles.map(article => ({ ...article, source: source.name })))
  }

  const economicContext = fredData?.map(item => {
    const latestValue = item.data_points?.[item.data_points.length - 1]?.value || 'N/A'
    return `${item.indicator_type}: ${latestValue} (${item.title})`
  }).join('; ') || 'Economic data pending'

  const newsContext = thinkTankArticles.slice(0, 3).map(article => 
    `${article.source}: ${article.title}`
  ).join('; ')

  const prompt = `Write a strategic analysis article focusing on current corridor economics developments. 

Current Economic Context: ${economicContext}

Recent Think Tank Research: ${newsContext}

Please create an article that:
1. Analyzes current economic indicators through a corridor economics lens
2. Identifies emerging strategic opportunities and risks
3. Provides actionable insights for business leaders
4. References recent geopolitical developments affecting trade corridors
5. Includes specific data points and trends

Title should be compelling and specific. Include a meta description for SEO. Format as HTML with proper headings and structure.`

  const content = await generateArticleWithAI(prompt, openaiKey)
  
  // Extract title from generated content
  const titleMatch = content.match(/<h1>(.*?)<\/h1>|^# (.*?)$/m)
  const title = titleMatch ? (titleMatch[1] || titleMatch[2]) : `Strategic Corridor Analysis - ${new Date().toLocaleDateString()}`
  
  // Create article
  const { data: article, error } = await supabase
    .from('articles')
    .insert({
      title,
      content,
      status: 'published',
      meta_description: `Strategic analysis of current corridor economics trends and opportunities. Published ${new Date().toLocaleDateString()}`,
      keywords: ['corridor economics', 'strategic analysis', 'geopolitics', 'trade'],
      content_type: 'article',
      user_id: '00000000-0000-0000-0000-000000000000', // System user
      published_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  
  return article
}

const createMonthlyTrendSummary = async (supabase: any, openaiKey: string) => {
  // Get last 30 days of FRED data
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  
  const { data: fredData } = await supabase
    .from('insights')
    .select('*')
    .eq('data_source', 'FRED')
    .gte('updated_at', thirtyDaysAgo)
    .eq('is_published', true)

  // Get recent articles for context
  const { data: recentArticles } = await supabase
    .from('articles')
    .select('title, keywords, published_at')
    .eq('status', 'published')
    .gte('published_at', thirtyDaysAgo)
    .order('published_at', { ascending: false })
    .limit(10)

  const trends = fredData?.map(item => {
    const dataPoints = item.data_points || []
    if (dataPoints.length < 2) return null
    
    const latest = dataPoints[dataPoints.length - 1]?.value
    const previous = dataPoints[dataPoints.length - 2]?.value
    const change = latest && previous ? ((latest - previous) / previous * 100).toFixed(2) : 'N/A'
    
    return `${item.indicator_type}: ${change}% change (${item.region})`
  }).filter(Boolean).join('; ')

  const prompt = `Create a comprehensive monthly trend summary for corridor economics analysis.

Economic Trends (Last 30 Days): ${trends}

Recent Analysis Topics: ${recentArticles?.map(a => a.title).join('; ') || 'Various strategic topics'}

Please create a detailed monthly summary that:
1. Synthesizes key economic trends and their strategic implications
2. Identifies emerging patterns in global trade corridors
3. Highlights geopolitical developments affecting strategic flows
4. Provides forward-looking analysis and recommendations
5. Includes data visualizations descriptions
6. Offers strategic positioning advice for businesses and policymakers

This should be a comprehensive 1500-2000 word analysis suitable for senior executives and policy makers. Include specific data points, trends, and actionable insights.`

  const content = await generateArticleWithAI(prompt, openaiKey)
  
  const title = `Monthly Corridor Economics Trends - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
  
  const { data: article, error } = await supabase
    .from('articles')
    .insert({
      title,
      content,
      status: 'published',
      meta_description: `Comprehensive monthly analysis of corridor economics trends, geopolitical developments, and strategic opportunities.`,
      keywords: ['monthly trends', 'corridor economics', 'geopolitical analysis', 'strategic outlook'],
      content_type: 'monthly_summary',
      user_id: '00000000-0000-0000-0000-000000000000',
      published_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  
  return article
}

const checkBreakingNews = async (supabase: any, openaiKey: string) => {
  // This would typically integrate with news APIs like GDELT, NewsAPI, etc.
  // For now, we'll create a placeholder that could be triggered manually
  
  const prompt = `Monitor and analyze breaking news related to corridor economics. 

Key monitoring areas:
- Suez Canal incidents or blockages
- Belt and Road Initiative developments
- BRICS currency and trade agreements
- Major supply chain disruptions
- Geopolitical tensions affecting trade routes
- Infrastructure investment announcements
- Maritime chokepoint issues

If significant corridor economics-related news is detected, create a rapid analysis article that:
1. Summarizes the immediate implications
2. Analyzes strategic corridor impacts
3. Provides short-term and long-term outlook
4. Offers strategic recommendations
5. Includes relevant context and background

Note: This is a monitoring framework. Actual implementation would require real-time news feeds.`

  // For demonstration, we'll create a template breaking news response
  const content = `
<h1>Breaking News Monitoring Active</h1>

<p>Our automated corridor economics monitoring system is tracking global developments that could impact strategic trade flows and geopolitical stability.</p>

<h2>Current Monitoring Focus</h2>
<ul>
<li>Suez Canal operations and potential disruptions</li>
<li>Belt and Road Initiative project developments</li>
<li>BRICS economic cooperation announcements</li>
<li>Major supply chain disruption events</li>
<li>Maritime chokepoint security incidents</li>
</ul>

<p>When significant events are detected, immediate analysis will be published with strategic implications and recommendations.</p>

<p><em>Last updated: ${new Date().toLocaleString()}</em></p>
`

  // This would only create an article if actual breaking news is detected
  return null
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY not configured')
    }

    const { scheduleType, forceExecute = false } = await req.json()

    let result = null

    switch (scheduleType) {
      case 'curated_article':
        result = await createCuratedArticle(supabaseClient, openaiKey)
        break
        
      case 'monthly_summary':
        result = await createMonthlyTrendSummary(supabaseClient, openaiKey)
        break
        
      case 'breaking_news':
        result = await checkBreakingNews(supabaseClient, openaiKey)
        break
        
      default:
        throw new Error(`Unknown schedule type: ${scheduleType}`)
    }

    // Update the schedule execution time
    if (result) {
      await supabaseClient
        .from('content_schedule')
        .update({
          last_executed: new Date().toISOString(),
          next_execution: new Date(Date.now() + (scheduleType === 'monthly_summary' ? 30 : 3) * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('schedule_type', scheduleType)
    }

    return new Response(JSON.stringify({
      success: true,
      scheduleType,
      article: result,
      message: result ? 'Article created successfully' : 'No action taken'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Content automation error:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})