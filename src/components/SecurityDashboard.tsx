import { useState, useEffect } from 'react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, AlertTriangle, CheckCircle, Download, RefreshCw } from 'lucide-react'
import SecurityMonitor from './SecurityMonitor'
import { useToast } from '@/hooks/use-toast'

interface SecurityMetrics {
  total_events: number
  failed_logins: number
  successful_logins: number
  csp_violations: number
  rate_limit_violations: number
  admin_actions: number
  recent_suspicious_activity: number
}

export function SecurityDashboard() {
  const { isAdmin } = useSupabaseAuth()
  const { toast } = useToast()
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSecurityMetrics = async () => {
    try {
      const { data: logs, error } = await supabase
        .from('security_audit_log')
        .select('action, created_at, details')
        .order('created_at', { ascending: false })
        .limit(1000)

      if (error) throw error

      const now = new Date()
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      const recentLogs = logs?.filter(log => new Date(log.created_at) > oneDayAgo) || []

      const calculatedMetrics: SecurityMetrics = {
        total_events: logs?.length || 0,
        failed_logins: recentLogs.filter(log => log.action.includes('login') && log.action.includes('fail')).length,
        successful_logins: recentLogs.filter(log => log.action.includes('login_success')).length,
        csp_violations: recentLogs.filter(log => log.action.includes('csp_violation')).length,
        rate_limit_violations: recentLogs.filter(log => log.action.includes('rate_limit')).length,
        admin_actions: recentLogs.filter(log => log.action.includes('admin')).length,
        recent_suspicious_activity: recentLogs.filter(log => {
          const details = log.details as any
          return details?.severity === 'high' || details?.severity === 'critical'
        }).length
      }

      setMetrics(calculatedMetrics)
      setError(null)
    } catch (err) {
      console.error('Error fetching security metrics:', err)
      setError('Failed to load security metrics')
    } finally {
      setLoading(false)
    }
  }

  const exportSecurityReport = async () => {
    try {
      const { data: logs, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const csvContent = [
        'Date,Action,User ID,IP Address,Severity,Details',
        ...(logs?.map(log => {
          const details = log.details as any
          return [
            new Date(log.created_at).toISOString(),
            log.action,
            log.user_id || 'N/A',
            log.ip_address || 'N/A',
            details?.severity || 'N/A',
            JSON.stringify(details || {})
          ].join(',')
        }) || [])
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `security-audit-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: "Export Complete",
        description: "Security audit report has been downloaded."
      })
    } catch (err) {
      console.error('Error exporting report:', err)
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Unable to generate security report."
      })
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchSecurityMetrics()
    }
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Admin privileges required to access the security dashboard.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Security Dashboard
          </h1>
          <p className="text-muted-foreground">Monitor and manage application security</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={fetchSecurityMetrics} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportSecurityReport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Security Events</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.total_events}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{metrics.failed_logins}</div>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Successful Logins</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{metrics.successful_logins}</div>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CSP Violations</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{metrics.csp_violations}</div>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rate Limit Violations</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{metrics.rate_limit_violations}</div>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Suspicious Activity</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{metrics.recent_suspicious_activity}</div>
                <p className="text-xs text-muted-foreground">High/Critical events</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="events" className="w-full">
            <TabsList>
              <TabsTrigger value="events">Security Events</TabsTrigger>
              <TabsTrigger value="config">Security Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="events" className="space-y-4">
              <SecurityMonitor />
            </TabsContent>
            
            <TabsContent value="config" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security Configuration</CardTitle>
                  <CardDescription>Current security settings and recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Authentication</h4>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">✅ JWT Verification</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">✅ Rate Limiting</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Security Headers</h4>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">✅ CORS</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">✅ CSP</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">✅ HSTS</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}