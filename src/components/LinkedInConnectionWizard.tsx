import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Linkedin, ExternalLink, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"

export function LinkedInConnectionWizard() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const { toast } = useToast()

  const initiateLinkedInOAuth = async () => {
    setIsConnecting(true)
    setConnectionStatus('connecting')

    try {
      // Call the LinkedIn OAuth edge function to get authorization URL
      const { data, error } = await supabase.functions.invoke('linkedin-oauth', {
        body: {
          action: 'initiate_oauth',
          redirect_uri: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        throw error
      }

      if (data?.authorization_url) {
        // Redirect to LinkedIn OAuth (full page redirect)
        window.location.href = data.authorization_url
      }
    } catch (error: any) {
      console.error('LinkedIn OAuth error:', error)
      setConnectionStatus('error')
      toast({
        title: "OAuth Setup Required", 
        description: "LinkedIn OAuth credentials need to be configured in the developer console",
        variant: "destructive",
      })
      setIsConnecting(false)
    }
  }

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        )
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
      case 'connecting':
        return (
          <Badge variant="outline">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Connecting...
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            Not Connected
          </Badge>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Linkedin className="h-5 w-5" />
          LinkedIn Connection Wizard
        </CardTitle>
        <CardDescription>
          Connect your LinkedIn account to enable content sharing and feed synchronization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Connection Status</p>
            <p className="text-sm text-muted-foreground">
              {connectionStatus === 'connected' 
                ? "Your LinkedIn account is connected and ready to use"
                : "No LinkedIn account connected"
              }
            </p>
          </div>
          {getStatusBadge()}
        </div>

        <div className="space-y-3">
          <Button
            onClick={initiateLinkedInOAuth}
            disabled={isConnecting || connectionStatus === 'connected'}
            className="w-full"
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting to LinkedIn...
              </>
            ) : connectionStatus === 'connected' ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                LinkedIn Connected
              </>
            ) : (
              <>
                <Linkedin className="h-4 w-4 mr-2" />
                Connect LinkedIn Account
              </>
            )}
          </Button>

          {connectionStatus === 'error' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-900 mb-1">Setup Required</h4>
              <p className="text-sm text-red-700 mb-2">
                LinkedIn OAuth needs to be configured in the LinkedIn Developer Console
              </p>
              <Button variant="outline" size="sm" asChild>
                <a 
                  href="https://www.linkedin.com/developers/apps" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  LinkedIn Developer Console
                </a>
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Required OAuth Setup</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• LinkedIn Developer App with OAuth 2.0</li>
            <li>• Redirect URI: <code className="text-xs bg-muted px-1 rounded">{window.location.origin}/auth/callback</code></li>
            <li>• Scopes: r_liteprofile, w_member_social, r_ugc_social</li>
            <li>• Client ID and Secret configured in Supabase secrets</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}