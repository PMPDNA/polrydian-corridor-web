import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Loader2, Instagram, RefreshCw, Upload, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface InstagramCredential {
  id: string
  platform_user_id: string
  is_active: boolean
  expires_at?: string
  profile_data: any
}

export function InstagramIntegration() {
  const [credentials, setCredentials] = useState<InstagramCredential | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [caption, setCaption] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    checkInstagramConnection()
  }, [])

  const checkInstagramConnection = async () => {
    setIsLoading(true)
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

      setCredentials(data || null)
    } catch (error: any) {
      console.error('Error checking Instagram connection:', error)
      toast({
        title: "Error",
        description: "Failed to check Instagram connection status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const syncInstagramData = async () => {
    setIsSyncing(true)
    try {
      const { data, error } = await supabase.functions.invoke('sync-instagram-data', {
        body: { action: 'sync_posts' }
      })

      if (error) throw error

      toast({
        title: "Sync Complete",
        description: `Successfully synced ${data.posts_synced} posts and added ${data.gallery_items_added} gallery items`,
      })

      // Refresh gallery after sync
      window.dispatchEvent(new CustomEvent('refresh-gallery'))
    } catch (error: any) {
      console.error('Error syncing Instagram data:', error)
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync Instagram data",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const publishToInstagram = async () => {
    if (!caption.trim() || !imageUrl.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both caption and image URL",
        variant: "destructive",
      })
      return
    }

    setIsPublishing(true)
    try {
      const { data, error } = await supabase.functions.invoke('publish-to-instagram', {
        body: {
          caption: caption.trim(),
          image_url: imageUrl.trim(),
          article_url: window.location.origin
        }
      })

      if (error) throw error

      toast({
        title: "Published Successfully",
        description: "Your content has been published to Instagram",
      })

      setCaption("")
      setImageUrl("")
    } catch (error: any) {
      console.error('Error publishing to Instagram:', error)
      toast({
        title: "Publishing Failed",
        description: error.message || "Failed to publish to Instagram",
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Checking Instagram connection...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Instagram Integration
          </CardTitle>
          <CardDescription>
            Manage your Instagram content synchronization and publishing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {credentials ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">@{credentials.profile_data?.username || 'Instagram Account'}</p>
                  <p className="text-sm text-muted-foreground">
                    Account Type: {credentials.profile_data?.account_type || 'Unknown'}
                  </p>
                  {credentials.profile_data?.followers_count && (
                    <p className="text-sm text-muted-foreground">
                      Followers: {credentials.profile_data.followers_count.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Eye className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                  {credentials.expires_at && (
                    <Badge variant="outline">
                      Expires: {new Date(credentials.expires_at).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={syncInstagramData}
                  disabled={isSyncing}
                  variant="outline"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Posts
                    </>
                  )}
                </Button>
                <Button onClick={checkInstagramConnection} variant="ghost" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Status
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Instagram className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Instagram Account Connected</h3>
              <p className="text-muted-foreground mb-4">
                Connect your Instagram Business account to sync posts and publish content
              </p>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Not Connected
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {credentials && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Publish to Instagram
            </CardTitle>
            <CardDescription>
              Create and publish new content to your Instagram account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                placeholder="Write your Instagram caption here... #hashtags"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                {caption.length}/2200 characters
              </p>
            </div>

            <Button
              onClick={publishToInstagram}
              disabled={isPublishing || !caption.trim() || !imageUrl.trim()}
              className="w-full"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Publish to Instagram
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}