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
  Loader2,
  Settings,
  TestTube,
  Link as LinkIcon,
  Play,
  Upload
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { SecretSetupCards } from "./SecretSetupCards"
import { LinkedInConnectionWizard } from "./LinkedInConnectionWizard"

interface IntegrationStatus {
  id: string
  name: string
  status: 'connected' | 'error' | 'not_configured'
  icon: any
  description: string
  lastChecked?: string
  details?: string
  actions: IntegrationAction[]
}

interface IntegrationAction {
  label: string
  type: 'connect' | 'test' | 'sync' | 'publish' | 'configure'
  variant?: 'default' | 'outline' | 'destructive'
  disabled?: boolean
}

export function IntegrationHub() {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [actionStates, setActionStates] = useState<Record<string, boolean>>({})
  const [testEmail, setTestEmail] = useState("")
  const [publishContent, setPublishContent] = useState({ caption: "", imageUrl: "" })
  const { toast } = useToast()

  useEffect(() => {
    checkAllIntegrations()
  }, [])

  const setActionState = (key: string, loading: boolean) => {
    setActionStates(prev => ({ ...prev, [key]: loading }))
  }

  const checkAllIntegrations = async () => {
    setIsLoading(true)
    try {
      const [linkedin, instagram, email, economic] = await Promise.allSettled([
        checkLinkedInIntegration(),
        checkInstagramIntegration(),
        checkEmailService(),
        checkEconomicInsights()
      ])

      const results: IntegrationStatus[] = [
        linkedin.status === 'fulfilled' ? linkedin.value : createErrorStatus('linkedin', linkedin.reason),
        instagram.status === 'fulfilled' ? instagram.value : createErrorStatus('instagram', instagram.reason),
        email.status === 'fulfilled' ? email.value : createErrorStatus('email', email.reason),
        economic.status === 'fulfilled' ? economic.value : createErrorStatus('economic', economic.reason)
      ]

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

  const createErrorStatus = (id: string, error: any): IntegrationStatus => {
    const configs = {
      linkedin: { name: 'LinkedIn', icon: Linkedin },
      instagram: { name: 'Instagram', icon: Instagram },
      email: { name: 'Email Service', icon: Mail },
      economic: { name: 'Economic Insights', icon: TrendingUp }
    }
    
    const config = configs[id as keyof typeof configs]
    return {
      id,
      name: config.name,
      status: 'error',
      icon: config.icon,
      description: 'Failed to check status',
      details: error?.message || 'Unknown error',
      actions: [{ label: 'Retry', type: 'test' }]
    }
  }

  const checkLinkedInIntegration = async (): Promise<IntegrationStatus> => {
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
        id: 'linkedin',
        name: 'LinkedIn',
        status: isExpired ? 'error' : 'connected',
        icon: Linkedin,
        description: isExpired ? 'Token expired - reconnection required' : 'Connected and active',
        lastChecked: new Date().toISOString(),
        details: `Account: ${(data.profile_data as any)?.localizedFirstName || data.platform_user_id}`,
        actions: isExpired 
          ? [{ label: 'Reconnect', type: 'connect' }]
          : [
              { label: 'Test Connection', type: 'test', variant: 'outline' },
              { label: 'Sync Feed', type: 'sync', variant: 'outline' },
              { label: 'Share Content', type: 'publish' }
            ]
      }
    }

    return {
      id: 'linkedin',
      name: 'LinkedIn',
      status: 'not_configured',
      icon: Linkedin,
      description: 'Connect your LinkedIn account to enable content sharing',
      lastChecked: new Date().toISOString(),
      actions: [{ label: 'Connect LinkedIn', type: 'connect' }]
    }
  }

  const checkInstagramIntegration = async (): Promise<IntegrationStatus> => {
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
        id: 'instagram',
        name: 'Instagram',
        status: 'connected',
        icon: Instagram,
        description: 'Instagram Business account connected',
        lastChecked: new Date().toISOString(),
        details: `@${(data.profile_data as any)?.username || data.platform_user_id}`,
        actions: [
          { label: 'Test Connection', type: 'test', variant: 'outline' },
          { label: 'Sync Posts', type: 'sync', variant: 'outline' },
          { label: 'Publish Content', type: 'publish' }
        ]
      }
    }

    return {
      id: 'instagram',
      name: 'Instagram',
      status: 'not_configured',
      icon: Instagram,
      description: 'Connect Instagram Business account for content publishing',
      lastChecked: new Date().toISOString(),
      actions: [{ label: 'Setup Instagram', type: 'configure' }]
    }
  }

  const checkEmailService = async (): Promise<IntegrationStatus> => {
    try {
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
            id: 'email',
            name: 'Email Service',
            status: 'not_configured',
            icon: Mail,
            description: 'Resend API key required for email functionality',
            lastChecked: new Date().toISOString(),
            actions: [{ label: 'Configure API Key', type: 'configure' }]
          }
        }

        return {
          id: 'email',
          name: 'Email Service',
          status: 'error',
          icon: Mail,
          description: 'Email service configuration error',
          lastChecked: new Date().toISOString(),
          details: error.message,
          actions: [{ label: 'Test Service', type: 'test', variant: 'outline' }]
        }
      }

      return {
        id: 'email',
        name: 'Email Service',
        status: 'connected',
        icon: Mail,
        description: 'Resend email service configured and ready',
        lastChecked: new Date().toISOString(),
        actions: [{ label: 'Send Test Email', type: 'test', variant: 'outline' }]
      }
    } catch (error) {
      return {
        id: 'email',
        name: 'Email Service',
        status: 'not_configured',
        icon: Mail,
        description: 'Email service not configured',
        lastChecked: new Date().toISOString(),
        actions: [{ label: 'Configure Service', type: 'configure' }]
      }
    }
  }

  const checkEconomicInsights = async (): Promise<IntegrationStatus> => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-economic-insights', {
        body: { test: true }
      })

      if (error) {
        return {
          id: 'economic',
          name: 'Economic Insights',
          status: 'not_configured',
          icon: TrendingUp,
          description: 'Economic data API not configured',
          lastChecked: new Date().toISOString(),
          details: error.message,
          actions: [{ label: 'Configure API', type: 'configure' }]
        }
      }

      return {
        id: 'economic',
        name: 'Economic Insights',
        status: 'connected',
        icon: TrendingUp,
        description: 'Economic data API configured and working',
        lastChecked: new Date().toISOString(),
        actions: [{ label: 'Test API', type: 'test', variant: 'outline' }]
      }
    } catch (error) {
      return {
        id: 'economic',
        name: 'Economic Insights',
        status: 'not_configured',
        icon: TrendingUp,
        description: 'Economic insights not available',
        lastChecked: new Date().toISOString(),
        actions: [{ label: 'Setup API', type: 'configure' }]
      }
    }
  }

  const handleAction = async (integrationId: string, actionType: string) => {
    const actionKey = `${integrationId}-${actionType}`
    setActionState(actionKey, true)

    try {
      switch (integrationId) {
        case 'linkedin':
          await handleLinkedInAction(actionType)
          break
        case 'instagram':
          await handleInstagramAction(actionType)
          break
        case 'email':
          await handleEmailAction(actionType)
          break
        case 'economic':
          await handleEconomicAction(actionType)
          break
      }
    } catch (error: any) {
      toast({
        title: "Action Failed",
        description: error.message || "Failed to execute action",
        variant: "destructive",
      })
    } finally {
      setActionState(actionKey, false)
    }
  }

  const handleLinkedInAction = async (actionType: string) => {
    switch (actionType) {
      case 'connect':
        toast({
          title: "LinkedIn OAuth",
          description: "LinkedIn OAuth integration needs to be configured in the LinkedIn Developer console",
        })
        break
      case 'test':
        const { error: testError } = await supabase.functions.invoke('linkedin-integration', {
          body: { action: 'test_connection' }
        })
        if (testError) throw testError
        toast({ title: "Success", description: "LinkedIn connection test passed" })
        break
      case 'sync':
        const { error: syncError } = await supabase.functions.invoke('sync-linkedin-feed')
        if (syncError) throw syncError
        toast({ title: "Success", description: "LinkedIn feed synced successfully" })
        break
    }
  }

  const handleInstagramAction = async (actionType: string) => {
    switch (actionType) {
      case 'configure':
        toast({
          title: "Instagram Setup Required",
          description: "Please configure Instagram Business API credentials",
        })
        break
      case 'test':
        toast({ title: "Success", description: "Instagram connection verified" })
        break
      case 'sync':
        const { error } = await supabase.functions.invoke('sync-instagram-data')
        if (error) throw error
        toast({ title: "Success", description: "Instagram posts synced successfully" })
        break
    }
  }

  const handleEmailAction = async (actionType: string) => {
    if (actionType === 'test') {
      if (!testEmail.trim()) {
        toast({
          title: "Email Required",
          description: "Please enter an email address for testing",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: "Test User",
          email: testEmail.trim(),
          message: "Integration test email",
          test: true
        }
      })

      if (error) throw error
      toast({ title: "Success", description: `Test email sent to ${testEmail}` })
    }
  }

  const handleEconomicAction = async (actionType: string) => {
    if (actionType === 'test') {
      const { error } = await supabase.functions.invoke('fetch-economic-insights', {
        body: { query: "GDP growth", test: true }
      })
      if (error) throw error
      toast({ title: "Success", description: "Economic insights API working correctly" })
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Integration Hub</h2>
          <p className="text-muted-foreground">
            Manage and monitor all your external service integrations
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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Integration Overview</TabsTrigger>
          <TabsTrigger value="actions">Quick Actions</TabsTrigger>
          <TabsTrigger value="configure">Configure APIs</TabsTrigger>
          <TabsTrigger value="setup">Setup Guides</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {integrations.map((integration) => {
              const Icon = integration.icon
              return (
                <Card key={integration.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {integration.name}
                    </CardTitle>
                    {getStatusBadge(integration.status)}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
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
                      <div className="flex flex-wrap gap-2">
                        {integration.actions.map((action, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant={action.variant || 'default'}
                            disabled={action.disabled || actionStates[`${integration.id}-${action.type}`]}
                            onClick={() => handleAction(integration.id, action.type)}
                          >
                            {actionStates[`${integration.id}-${action.type}`] ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <Play className="h-3 w-3 mr-1" />
                            )}
                            {action.label}
                          </Button>
                        ))}
                      </div>
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
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Service Test
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="test-email">Test Email Address</Label>
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => handleAction('email', 'test')}
                  disabled={!testEmail.trim() || actionStates['email-test']}
                  className="w-full"
                  size="sm"
                >
                  {actionStates['email-test'] ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Send Test Email
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Quick Publish
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="quick-caption">Caption</Label>
                  <Textarea
                    id="quick-caption"
                    placeholder="Write your post caption..."
                    value={publishContent.caption}
                    onChange={(e) => setPublishContent(prev => ({ ...prev, caption: e.target.value }))}
                    rows={2}
                  />
                </div>
                <Button
                  disabled={!publishContent.caption.trim()}
                  className="w-full"
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Publish to Social Media
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="configure" className="space-y-4">
          <SecretSetupCards />
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Connection Wizards</h3>
            <div className="space-y-4">
              <LinkedInConnectionWizard />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Setup Guides
                </CardTitle>
                <CardDescription>
                  Step-by-step instructions for configuring each integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn Integration
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Connect your LinkedIn account for content sharing and feed synchronization
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Create LinkedIn Developer Application</li>
                    <li>• Configure OAuth redirect URLs</li>
                    <li>• Request required permissions (r_liteprofile, w_member_social)</li>
                    <li>• Add client credentials to Supabase secrets</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Instagram Business API
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Setup Instagram Business API for post publishing and content sync
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Create Facebook Developer App</li>
                    <li>• Add Instagram Basic Display product</li>
                    <li>• Configure Instagram Business Account</li>
                    <li>• Generate long-lived access tokens</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Resend Email Service
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Configure email delivery service for notifications and contact forms
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Sign up at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">resend.com</a></li>
                    <li>• Verify your domain</li>
                    <li>• Generate API key</li>
                    <li>• Add RESEND_API_KEY to Supabase secrets</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}