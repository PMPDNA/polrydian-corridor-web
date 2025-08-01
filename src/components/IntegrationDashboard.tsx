import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Mail, 
  Instagram, 
  Linkedin, 
  TrendingUp,
  Loader2 
} from "lucide-react"

interface IntegrationStatus {
  name: string
  status: 'connected' | 'error' | 'not_configured'
  icon: any
  description: string
  lastChecked?: string
  details?: string
}

export function IntegrationDashboard() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    checkAllIntegrations()
  }, [])

  const checkAllIntegrations = async () => {
    setIsLoading(true)
    try {
      const checks = await Promise.allSettled([
        checkLinkedInIntegration(),
        checkInstagramIntegration(),
        checkEmailService(),
        checkEconomicInsights()
      ])

      const results = checks.map((check, index) => {
        if (check.status === 'fulfilled') {
          return check.value
        } else {
          const names = ['LinkedIn', 'Instagram', 'Email Service', 'Economic Insights']
          return {
            name: names[index],
            status: 'error' as const,
            icon: XCircle,
            description: 'Failed to check status',
            details: check.reason?.message || 'Unknown error'
          }
        }
      })

      setIntegrations(results)
    } catch (error) {
      console.error('Error checking integrations:', error)
      toast({
        title: "Error",
        description: "Failed to check integration status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const checkLinkedInIntegration = async (): Promise<IntegrationStatus> => {
    try {
      const { data, error } = await supabase
        .from('social_media_credentials')
        .select('*')
        .eq('platform', 'linkedin')
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        const isExpired = data.expires_at && new Date(data.expires_at) < new Date()
        return {
          name: 'LinkedIn',
          status: isExpired ? 'error' : 'connected',
          icon: Linkedin,
          description: isExpired ? 'Token expired' : 'Connected and active',
          lastChecked: new Date().toISOString(),
          details: `User: ${data.platform_user_id}`
        }
      }

      return {
        name: 'LinkedIn',
        status: 'not_configured',
        icon: Linkedin,
        description: 'Not connected',
        lastChecked: new Date().toISOString()
      }
    } catch (error) {
      throw new Error(`LinkedIn check failed: ${error.message}`)
    }
  }

  const checkInstagramIntegration = async (): Promise<IntegrationStatus> => {
    try {
      const { data, error } = await supabase
        .from('social_media_credentials')
        .select('*')
        .eq('platform', 'instagram')
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        return {
          name: 'Instagram',
          status: 'connected',
          icon: Instagram,
          description: 'Connected and active',
          lastChecked: new Date().toISOString(),
          details: `Account: ${(data.profile_data as any)?.username || data.platform_user_id}`
        }
      }

      return {
        name: 'Instagram',
        status: 'not_configured',
        icon: Instagram,
        description: 'Not connected',
        lastChecked: new Date().toISOString()
      }
    } catch (error) {
      throw new Error(`Instagram check failed: ${error.message}`)
    }
  }

  const checkEmailService = async (): Promise<IntegrationStatus> => {
    try {
      // Test email service by attempting to call the function
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: "System Test",
          email: "test@example.com",
          message: "Integration status check",
          test: true,
          dry_run: true
        }
      })

      if (error) {
        if (error.message?.includes('RESEND_API_KEY')) {
          return {
            name: 'Email Service',
            status: 'not_configured',
            icon: Mail,
            description: 'Resend API key not configured',
            lastChecked: new Date().toISOString()
          }
        }

        return {
          name: 'Email Service',
          status: 'error',
          icon: Mail,
          description: 'Service error',
          lastChecked: new Date().toISOString(),
          details: error.message
        }
      }

      return {
        name: 'Email Service',
        status: 'connected',
        icon: Mail,
        description: 'Resend service configured',
        lastChecked: new Date().toISOString()
      }
    } catch (error) {
      return {
        name: 'Email Service',
        status: 'not_configured',
        icon: Mail,
        description: 'Not configured',
        lastChecked: new Date().toISOString()
      }
    }
  }

  const checkEconomicInsights = async (): Promise<IntegrationStatus> => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-economic-insights')

      if (error) {
        return {
          name: 'Economic Insights',
          status: 'not_configured',
          icon: TrendingUp,
          description: 'API not configured',
          lastChecked: new Date().toISOString(),
          details: error.message
        }
      }

      return {
        name: 'Economic Insights',
        status: 'connected',
        icon: TrendingUp,
        description: 'API configured and working',
        lastChecked: new Date().toISOString()
      }
    } catch (error) {
      return {
        name: 'Economic Insights',
        status: 'not_configured',
        icon: TrendingUp,
        description: 'Not configured',
        lastChecked: new Date().toISOString()
      }
    }
  }

  const getStatusBadge = (status: IntegrationStatus['status']) => {
    switch (status) {
      case 'connected':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        )
      case 'error':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
      case 'not_configured':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Not Configured
          </Badge>
        )
    }
  }

  const getStatusIcon = (status: IntegrationStatus['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'not_configured':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Integration Status</h2>
          <p className="text-muted-foreground">
            Monitor the status of all external service integrations
          </p>
        </div>
        <Button onClick={checkAllIntegrations} disabled={isLoading} variant="outline">
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh All
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {integrations.map((integration) => {
          const Icon = integration.icon
          return (
            <Card key={integration.name}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {integration.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusIcon(integration.status)}
                  {getStatusBadge(integration.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {integration.description}
                  </p>
                  {integration.details && (
                    <p className="text-xs text-muted-foreground">
                      {integration.details}
                    </p>
                  )}
                  {integration.lastChecked && (
                    <p className="text-xs text-muted-foreground">
                      Last checked: {new Date(integration.lastChecked).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {isLoading && integrations.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Checking integration status...</span>
        </div>
      )}
    </div>
  )
}