import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Secure CORS headers - restrict to known domains
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://polrydian.com, https://d85f6385-6c6d-437f-978b-9196bd33e526.lovableproject.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Check admin access for authenticated users
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: { Authorization: authHeader }
          }
        }
      )
      
      // Verify admin access
      const { data: isAdmin, error } = await supabaseClient
        .rpc('check_admin_access')
      
      if (error || !isAdmin) {
        return new Response(
          JSON.stringify({ error: 'Admin access required' }),
          { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('🏥 Starting integration health check...')

    // Check active credentials for each platform
    const { data: credentials, error: credError } = await supabase
      .from('social_media_credentials')
      .select('platform, is_active, expires_at, updated_at')

    if (credError) {
      throw credError
    }

    console.log(`Found ${credentials?.length || 0} credentials`)

    // Get recent integration logs for error analysis
    const { data: logs, error: logsError } = await supabase
      .from('integration_logs')
      .select('integration_type, status, error_message, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(100)

    if (logsError) {
      console.warn('Failed to fetch logs:', logsError)
    }

    // Analyze health for each integration
    const integrations: Record<string, any> = {}
    const alerts: Array<{platform: string, severity: string, message: string, error?: string}> = []

    const platforms = ['linkedin', 'instagram']
    
    for (const platform of platforms) {
      const platformCreds = credentials?.filter(c => c.platform === platform) || []
      const activeCreds = platformCreds.filter(c => c.is_active)
      const platformLogs = logs?.filter(l => l.integration_type === platform) || []
      
      // Check for expired tokens
      const now = new Date()
      const expiredCreds = activeCreds.filter(c => 
        c.expires_at && new Date(c.expires_at) <= now
      )

      // Check for recent errors
      const recentErrors = platformLogs
        .filter(l => l.status === 'error')
        .slice(0, 5)

      // Calculate success rate
      const totalOps = platformLogs.length
      const successOps = platformLogs.filter(l => l.status === 'success').length
      const successRate = totalOps > 0 ? (successOps / totalOps) * 100 : 0

      // Determine health status
      let status = 'healthy'
      const issues: string[] = []

      if (expiredCreds.length > 0) {
        status = 'error'
        issues.push(`${expiredCreds.length} expired token(s)`)
        alerts.push({
          platform,
          severity: 'high',
          message: `${expiredCreds.length} expired credential(s) found`,
          error: 'Token refresh required'
        })
      }

      if (activeCreds.length === 0) {
        status = 'error'
        issues.push('No active credentials')
        alerts.push({
          platform,
          severity: 'high', 
          message: 'No active credentials configured',
          error: 'Setup required'
        })
      }

      if (recentErrors.length > 3) {
        status = status === 'healthy' ? 'warning' : status
        issues.push(`${recentErrors.length} recent errors`)
        alerts.push({
          platform,
          severity: 'medium',
          message: `${recentErrors.length} errors in the last 24 hours`,
          error: recentErrors[0]?.error_message || 'Multiple errors detected'
        })
      }

      if (successRate < 80 && totalOps > 0) {
        status = status === 'healthy' ? 'warning' : status
        issues.push(`Low success rate: ${successRate.toFixed(1)}%`)
      }

      integrations[platform] = {
        status,
        active_credentials: activeCreds.length,
        issues,
        last_checked: new Date().toISOString(),
        success_rate: successRate,
        total_operations: totalOps,
        recent_errors: recentErrors.length,
        message: status === 'healthy' 
          ? `${activeCreds.length} active connection(s), ${successRate.toFixed(1)}% success rate`
          : issues.join(', ')
      }
    }

    // Determine overall status
    const allStatuses = Object.values(integrations).map((i: any) => i.status)
    let overallStatus = 'healthy'
    
    if (allStatuses.includes('error')) {
      overallStatus = 'error'
    } else if (allStatuses.includes('warning')) {
      overallStatus = 'warning'
    }

    const healthReport = {
      overall_status: overallStatus,
      integrations,
      alerts: alerts.slice(0, 10), // Limit alerts
      timestamp: new Date().toISOString(),
      summary: {
        total_integrations: platforms.length,
        healthy_integrations: allStatuses.filter(s => s === 'healthy').length,
        warning_integrations: allStatuses.filter(s => s === 'warning').length,
        error_integrations: allStatuses.filter(s => s === 'error').length
      }
    }

    console.log('✅ Health check completed:', {
      overall: overallStatus,
      alerts: alerts.length,
      integrations: Object.keys(integrations).length
    })

    return new Response(
      JSON.stringify(healthReport),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('🚨 Health check failed:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        overall_status: 'error',
        integrations: {},
        alerts: [{
          platform: 'system',
          severity: 'high',
          message: 'Health check system failure',
          error: error.message
        }],
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})