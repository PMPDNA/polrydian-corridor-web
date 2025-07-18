import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, AlertTriangle, Clock, User, Eye, RefreshCw } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'

interface SecurityEvent {
  id: string
  user_id: string | null
  action: string
  details: any
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export default function SecurityMonitor() {
  const [events, setEvents] = useState<SecurityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAdmin } = useSupabaseAuth()

  const fetchSecurityEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setEvents((data || []) as SecurityEvent[])
    } catch (err: any) {
      console.error('Error fetching security events:', err)
      setError('Failed to load security events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchSecurityEvents()
    }
  }, [isAdmin])

  const getEventIcon = (action: string) => {
    switch (action) {
      case 'login_success':
        return <Shield className="h-4 w-4 text-green-600" />
      case 'login_failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'rate_limit_violation':
        return <Clock className="h-4 w-4 text-orange-600" />
      case 'role_change':
        return <User className="h-4 w-4 text-blue-600" />
      default:
        return <Eye className="h-4 w-4 text-gray-600" />
    }
  }

  const getEventVariant = (action: string) => {
    switch (action) {
      case 'login_success':
        return 'default'
      case 'login_failed':
      case 'rate_limit_violation':
        return 'destructive'
      case 'role_change':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const formatEventDetails = (action: string, details: any) => {
    switch (action) {
      case 'login_success':
        return `User logged in: ${details.email}`
      case 'login_failed':
        return `Failed login attempt: ${details.email} - ${details.error}`
      case 'rate_limit_violation':
        return `Rate limit exceeded: ${details.email} (${details.remaining_time}min cooldown)`
      case 'role_change':
        return `Role changed: ${details.old_role} → ${details.new_role} for user ${details.target_user_id}`
      default:
        return JSON.stringify(details)
    }
  }

  if (!isAdmin) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You need admin privileges to view security monitoring data.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Monitor</h2>
          <p className="text-muted-foreground">
            Real-time security events and audit trail
          </p>
        </div>
        <Button
          onClick={fetchSecurityEvents}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                Loading security events...
              </div>
            </CardContent>
          </Card>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Security Events</h3>
              <p className="text-muted-foreground">
                Security audit log is empty. Events will appear here as they occur.
              </p>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getEventIcon(event.action)}
                    <CardTitle className="text-base">
                      {event.action.replace(/_/g, ' ').toUpperCase()}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getEventVariant(event.action)}>
                      {event.action}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="mb-2">
                  {formatEventDetails(event.action, event.details)}
                </CardDescription>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>IP: {event.ip_address}</div>
                  <div>User Agent: {event.user_agent?.substring(0, 80)}...</div>
                  {event.user_id && <div>User ID: {event.user_id}</div>}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}