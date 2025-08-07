import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw, Download, CheckCircle, AlertTriangle, Loader2, ExternalLink } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

export default function LinkedInSyncManager() {
  const [syncLoading, setSyncLoading] = useState(false)
  const [lastSyncData, setLastSyncData] = useState<any>(null)
  const { toast } = useToast()

  const performLinkedInSync = async () => {
    setSyncLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('sync-linkedin-feed')

      if (error) {
        throw new Error(error.message)
      }

      if (data.error) {
        throw new Error(data.error)
      }

      setLastSyncData(data)
      toast({
        title: "LinkedIn Sync Successful",
        description: `Synced ${data.inserted || 0} posts out of ${data.total || 0} found.`,
      })
    } catch (error: any) {
      console.error('LinkedIn sync error:', error)
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync LinkedIn posts. Check your connection and credentials.",
        variant: "destructive",
      })
    } finally {
      setSyncLoading(false)
    }
  }

  const checkSyncStatus = async () => {
    try {
      // Check how many LinkedIn posts we have in the database
      const { data: posts, error } = await supabase
        .from('linkedin_posts')
        .select('id, created_at, message')
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) throw error

      if (posts && posts.length > 0) {
        toast({
          title: "Sync Status",
          description: `Last LinkedIn post in database: ${new Date(posts[0].created_at).toLocaleDateString()}`,
        })
      } else {
        toast({
          title: "No Data",
          description: "No LinkedIn posts found in database. Try running a sync.",
        })
      }
    } catch (error: any) {
      toast({
        title: "Status Check Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-blue-600" />
          LinkedIn Content Sync
        </CardTitle>
        <CardDescription>
          Synchronize your LinkedIn posts and articles to the website
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            LinkedIn sync uses the latest REST API format for reliable content import.
          </AlertDescription>
        </Alert>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            LinkedIn authorization is pending. Please contact the administrator to configure API access.
          </AlertDescription>
        </Alert>

        <div className="flex gap-3">
          <Button 
            disabled={true}
            variant="outline"
            className="gap-2 opacity-50"
          >
            <Download className="h-4 w-4" />
            Sync LinkedIn Posts (Authorization Pending)
          </Button>
          
          <Button 
            onClick={checkSyncStatus} 
            variant="outline" 
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Check Status
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open('https://www.linkedin.com/in/patrick-misiewicz-mslscm-28299b40', '_blank')}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            LinkedIn Profile
          </Button>
        </div>

        {lastSyncData && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Last sync: {lastSyncData.inserted} posts inserted out of {lastSyncData.total} found.
              {lastSyncData.inserted === 0 && lastSyncData.total > 0 && (
                <span className="text-yellow-600 ml-2">
                  Posts may already exist in the database.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Sync Pipeline</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">1</Badge>
              <span>Fetch posts from LinkedIn REST API</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">2</Badge>
              <span>Store in linkedin_posts and social_media_posts tables</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">3</Badge>
              <span>Display in Articles section and LinkedIn feed</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">4</Badge>
              <span>Cross-post to Substack (via Zapier integration)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}