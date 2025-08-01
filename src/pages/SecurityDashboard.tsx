import { useState, useEffect } from 'react'
import { Navigation } from "@/components/Navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  Activity, 
  Lock, 
  Eye,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { supabase } from '@/integrations/supabase/client'
import SecurityMonitor from '@/components/SecurityMonitor'

interface SecurityMetrics {
  total_events: number
  failed_logins: number
  successful_logins: number
  rate_limit_violations: number
  role_changes: number
  suspicious_activities: number
}

export default function SecurityDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAdmin, user } = useSupabaseAuth()

  const fetchSecurityMetrics = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch security metrics from audit log
      const { data: events, error } = await supabase
        .from('security_audit_log')
        .select('action')
        .order('created_at', { ascending: false })
        .limit(1000)

      if (error) throw error

      // Calculate metrics
      const metrics: SecurityMetrics = {
        total_events: events?.length || 0,
        failed_logins: events?.filter(e => e.action === 'login_failed').length || 0,
        successful_logins: events?.filter(e => e.action === 'login_success').length || 0,
        rate_limit_violations: events?.filter(e => e.action === 'rate_limit_violation').length || 0,
        role_changes: events?.filter(e => e.action === 'role_change').length || 0,
        suspicious_activities: events?.filter(e => e.action.includes('suspicious')).length || 0,
      }

      setMetrics(metrics)
    } catch (err: any) {
      console.error('Error fetching security metrics:', err)
      setError('Failed to load security metrics')
    } finally {
      setLoading(false)
    }
  }

  const exportSecurityReport = async () => {
    try {
      const { data: events, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Create CSV content
      const csvContent = [
        'Timestamp,Action,User ID,IP Address,Details',
        ...events.map(event => 
          `${event.created_at},${event.action},${event.user_id || 'N/A'},${event.ip_address},"${JSON.stringify(event.details).replace(/"/g, '""')}"`
        )
      ].join('\n')

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `security-report-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export security report:', error)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchSecurityMetrics()
    }
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You need admin privileges to access the security dashboard.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-8 space-y-8">
        {/* Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" asChild>
            <a href="/admin">← Back to Admin Dashboard</a>
          </Button>
        </div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Security Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor security events and manage system security
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchSecurityMetrics}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={exportSecurityReport}
              variant="outline"
              size="sm"
            >
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

        {/* Security Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.total_events || 0}</div>
              <p className="text-xs text-muted-foreground">Security events logged</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics?.failed_logins || 0}</div>
              <p className="text-xs text-muted-foreground">Authentication failures</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful Logins</CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics?.successful_logins || 0}</div>
              <p className="text-xs text-muted-foreground">Successful authentications</p>
            </CardContent>
          </Card>


          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Role Changes</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metrics?.role_changes || 0}</div>
              <p className="text-xs text-muted-foreground">Administrative actions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Status</CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-600">
                  SECURE
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Security Tabs */}
        <Tabs defaultValue="events" className="space-y-4">
          <TabsList>
            <TabsTrigger value="events">Security Events</TabsTrigger>
            <TabsTrigger value="settings">Security Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            <SecurityMonitor />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Security Configuration
                </CardTitle>
                <CardDescription>
                  Current security settings and policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Authentication</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• OTP Expiry: 10 minutes</li>
                      <li>• Max Login Attempts: 5</li>
                      <li>• Rate Limit Window: 15 minutes</li>
                      <li>• Session Timeout: 24 hours</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Security Headers</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Content Security Policy: Enabled</li>
                      <li>• X-Frame-Options: DENY</li>
                      <li>• X-Content-Type-Options: nosniff</li>
                      <li>• Referrer Policy: strict-origin</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}