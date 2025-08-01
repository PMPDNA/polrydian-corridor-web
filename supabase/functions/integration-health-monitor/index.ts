import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    console.log('🔍 Starting integration health monitoring...')
    
    const healthResults = {
      overall_status: 'healthy',
      integrations: {},
      alerts: [],
      timestamp: new Date().toISOString()
    }
    
    // Check all active integrations
    const { data: credentials, error: fetchError } = await supabase
      .from('social_media_credentials')
      .select('*')
      .eq('is_active', true)
    
    if (fetchError) {
      console.error('Error fetching credentials:', fetchError)
      throw fetchError
    }
    
    // Group credentials by platform
    const platformGroups = (credentials || []).reduce((acc, cred) => {
      if (!acc[cred.platform]) acc[cred.platform] = []
      acc[cred.platform].push(cred)
      return acc
    }, {})
    
    // Monitor each platform
    for (const [platform, platformCreds] of Object.entries(platformGroups)) {
      try {
        console.log(`🔍 Monitoring ${platform} integration...`)
        
        const platformHealth = await checkPlatformHealth(platform, platformCreds, supabase)
        healthResults.integrations[platform] = platformHealth
        
        // Generate alerts if needed
        if (platformHealth.status !== 'healthy') {
          healthResults.alerts.push({
            platform,
            severity: platformHealth.status === 'error' ? 'high' : 'medium',
            message: platformHealth.message || `${platform} integration has issues`,
            details: platformHealth.details
          })
        }
        
        // Log health check
        await supabase.rpc('log_integration_event', {
          p_integration_type: platform,
          p_operation: 'health_check',
          p_status: platformHealth.status === 'healthy' ? 'success' : 'error',
          p_response_data: platformHealth
        })
        
      } catch (error) {
        console.error(`❌ Health check failed for ${platform}:`, error)
        
        healthResults.integrations[platform] = {
          status: 'error',
          message: 'Health check failed',
          error: error.message
        }
        
        healthResults.alerts.push({
          platform,
          severity: 'high',
          message: `${platform} health check failed`,
          error: error.message
        })
      }
    }
    
    // Check integration logs for recent errors
    const recentErrors = await checkRecentErrors(supabase)
    if (recentErrors.length > 0) {
      healthResults.alerts.push(...recentErrors)
    }
    
    // Determine overall status
    const hasErrors = Object.values(healthResults.integrations).some(
      (integration: any) => integration.status === 'error'
    )
    const hasWarnings = Object.values(healthResults.integrations).some(
      (integration: any) => integration.status === 'warning'
    )
    
    if (hasErrors) {
      healthResults.overall_status = 'error'
    } else if (hasWarnings) {
      healthResults.overall_status = 'warning'
    }
    
    // Send alerts if critical issues found
    if (healthResults.alerts.length > 0) {
      await sendHealthAlerts(healthResults.alerts, supabase)
    }
    
    console.log(`🏁 Health monitoring completed. Status: ${healthResults.overall_status}`)
    
    return new Response(
      JSON.stringify(healthResults),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
    
  } catch (error) {
    console.error('🚨 Health monitoring failed:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        overall_status: 'error',
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function checkPlatformHealth(platform: string, credentials: any[], supabase: any) {
  const now = new Date()
  const issues = []
  
  // Check token expiry
  for (const cred of credentials) {
    if (cred.expires_at) {
      const expiresAt = new Date(cred.expires_at)
      const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)
      
      if (hoursUntilExpiry < 0) {
        issues.push(`Token expired for user ${cred.user_id}`)
      } else if (hoursUntilExpiry < 24) {
        issues.push(`Token expires in ${Math.round(hoursUntilExpiry)} hours for user ${cred.user_id}`)
      }
    }
  }
  
  // Test API connectivity
  try {
    if (platform === 'linkedin') {
      await testLinkedInConnectivity(credentials[0], supabase)
    } else if (platform === 'instagram') {
      await testInstagramConnectivity(credentials[0], supabase)
    }
  } catch (error) {
    issues.push(`API connectivity test failed: ${error.message}`)
  }
  
  // Determine status
  let status = 'healthy'
  if (issues.some(issue => issue.includes('expired') || issue.includes('failed'))) {
    status = 'error'
  } else if (issues.length > 0) {
    status = 'warning'
  }
  
  return {
    status,
    active_credentials: credentials.length,
    issues,
    last_checked: now.toISOString(),
    message: issues.length > 0 ? issues[0] : 'All systems operational'
  }
}

async function testLinkedInConnectivity(credential: any, supabase: any) {
  if (!credential) return
  
  // Decrypt token
  const { data: accessToken } = await supabase.rpc('decrypt_token_secure', {
    encrypted_token: credential.access_token_encrypted
  })
  
  if (!accessToken) {
    throw new Error('Failed to decrypt access token')
  }
  
  // Test API call to LinkedIn
  const response = await fetch('https://api.linkedin.com/v2/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'cache-control': 'no-cache',
      'X-Restli-Protocol-Version': '2.0.0'
    }
  })
  
  if (!response.ok) {
    throw new Error(`LinkedIn API test failed: ${response.status}`)
  }
}

async function testInstagramConnectivity(credential: any, supabase: any) {
  if (!credential) return
  
  // Decrypt token
  const { data: accessToken } = await supabase.rpc('decrypt_token_secure', {
    encrypted_token: credential.access_token_encrypted
  })
  
  if (!accessToken) {
    throw new Error('Failed to decrypt access token')
  }
  
  // Test API call to Instagram
  const response = await fetch(
    `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
  )
  
  if (!response.ok) {
    throw new Error(`Instagram API test failed: ${response.status}`)
  }
}

async function checkRecentErrors(supabase: any) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  
  const { data: recentErrors } = await supabase
    .from('integration_logs')
    .select('integration_type, operation, error_message')
    .eq('status', 'error')
    .gte('created_at', oneHourAgo)
    .limit(10)
  
  return (recentErrors || []).map(error => ({
    platform: error.integration_type,
    severity: 'medium',
    message: `Recent ${error.operation} operation failed`,
    error: error.error_message
  }))
}

async function sendHealthAlerts(alerts: any[], supabase: any) {
  // Log critical alerts
  const criticalAlerts = alerts.filter(alert => alert.severity === 'high')
  
  for (const alert of criticalAlerts) {
    await supabase.rpc('log_integration_event', {
      p_integration_type: alert.platform,
      p_operation: 'health_alert',
      p_status: 'error',
      p_error_message: alert.message,
      p_response_data: alert
    })
    
    console.log(`🚨 CRITICAL ALERT: ${alert.platform} - ${alert.message}`)
  }
  
  // In a production environment, you could send these alerts to:
  // - Email notifications
  // - Slack webhooks
  // - PagerDuty
  // - SMS alerts
  // etc.
}