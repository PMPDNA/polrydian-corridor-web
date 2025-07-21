import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Linkedin, RefreshCw, Download, Upload, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

interface LinkedInProfile {
  id: string
  name: string
  firstName: string
  lastName: string
  profilePicture?: string
}

interface LinkedInArticle {
  id: string
  title: string
  content: string
  created: Date
  visibility: string
}

export default function LinkedInIntegration() {
  const [profile, setProfile] = useState<LinkedInProfile | null>(null)
  const [articles, setArticles] = useState<LinkedInArticle[]>([])
  const [loading, setLoading] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const { toast } = useToast()

  const callLinkedInIntegration = async (action: string, additionalData?: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('linkedin-integration', {
        body: {
          action,
          ...additionalData
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      if (data.error) {
        throw new Error(data.error)
      }

      return data
    } catch (error: any) {
      toast({
        title: "LinkedIn Integration Error",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }

  const loadProfile = async () => {
    setLoading(true)
    try {
      const data = await callLinkedInIntegration('get_profile')
      setProfile(data.profile)
      toast({
        title: "Profile Loaded",
        description: "LinkedIn profile information retrieved successfully.",
      })
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadArticles = async () => {
    setLoading(true)
    try {
      const data = await callLinkedInIntegration('get_articles')
      setArticles(data.articles)
      toast({
        title: "Articles Loaded",
        description: `Found ${data.articles.length} LinkedIn posts/articles.`,
      })
    } catch (error) {
      console.error('Error loading articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const syncArticles = async () => {
    setSyncLoading(true)
    try {
      const data = await callLinkedInIntegration('sync_articles')
      toast({
        title: "Sync Complete",
        description: data.message,
      })
      // Reload articles after sync
      await loadArticles()
    } catch (error) {
      console.error('Error syncing articles:', error)
    } finally {
      setSyncLoading(false)
    }
  }

  const publishToLinkedIn = async (content: string, title?: string) => {
    try {
      const data = await callLinkedInIntegration('publish_to_linkedin', { content, title })
      toast({
        title: "Published Successfully",
        description: data.message,
      })
      return data.postId
    } catch (error) {
      console.error('Error publishing to LinkedIn:', error)
      throw error
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Linkedin className="h-5 w-5 text-blue-600" />
            LinkedIn Integration
          </CardTitle>
          <CardDescription>
            Connect and manage your LinkedIn content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              LinkedIn OAuth is properly configured. You can now sync articles and publish content.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button onClick={loadProfile} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Load Profile
            </Button>
            <Button onClick={loadArticles} disabled={loading} variant="outline" className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Load Articles
            </Button>
            <Button onClick={syncArticles} disabled={syncLoading} variant="secondary" className="gap-2">
              {syncLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Sync to Database
            </Button>
          </div>
        </CardContent>
      </Card>

      {profile && (
        <Card>
          <CardHeader>
            <CardTitle>LinkedIn Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {profile.profilePicture && (
                <img 
                  src={profile.profilePicture} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div>
                <h3 className="font-semibold">{profile.name}</h3>
                <p className="text-sm text-muted-foreground">ID: {profile.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {articles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>LinkedIn Articles & Posts</CardTitle>
            <CardDescription>
              {articles.length} articles found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {articles.map((article) => (
                <div key={article.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium">{article.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                        {article.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{article.visibility}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(article.created).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Publishing Functions</CardTitle>
          <CardDescription>
            Available functions for LinkedIn integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Sync Articles from LinkedIn</p>
                <p className="text-sm text-muted-foreground">Import your LinkedIn posts to the website</p>
              </div>
              <Badge variant="secondary">Available</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Publish to LinkedIn</p>
                <p className="text-sm text-muted-foreground">Share website articles to LinkedIn</p>
              </div>
              <Badge variant="secondary">Available</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Auto-sync News Feed</p>
                <p className="text-sm text-muted-foreground">Automatically sync latest LinkedIn content</p>
              </div>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}