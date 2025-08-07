import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Instagram, 
  Linkedin, 
  RefreshCw, 
  Upload, 
  Camera,
  ExternalLink,
  Eye,
  EyeOff,
  Star,
  Heart,
  MessageCircle,
  Share,
  Calendar,
  Check,
  X,
  Clock
} from 'lucide-react';
import { LinkedInConnectionStatus } from './LinkedInConnectionStatus';

interface SocialPost {
  id: string;
  platform: string;
  platform_post_id: string;
  post_type: string;
  title?: string;
  content?: string;
  image_url?: string;
  post_url?: string;
  published_at?: string;
  engagement_data?: any;
  hashtags?: any;
  is_featured: boolean;
  is_visible: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
}

interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  category: string;
  instagram_post_id?: string;
  is_featured: boolean;
  is_visible: boolean;
  created_at: string;
}

export const SocialMediaManager = () => {
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'general',
    instagram_post_id: ''
  });
  const [publishForm, setPublishForm] = useState({
    platform: 'linkedin',
    title: '',
    content: '',
    image_url: '',
    article_url: ''
  });
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSocialPosts();
    loadGallery();
  }, []);

  const loadSocialPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('social_media_posts')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setSocialPosts((data || []) as SocialPost[]);
    } catch (error: any) {
      console.error('Error loading social posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load social media posts.',
        variant: 'destructive',
      });
    }
  };

  const loadGallery = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGalleryItems(data || []);
    } catch (error: any) {
      console.error('Error loading gallery:', error);
      toast({
        title: 'Error',
        description: 'Failed to load gallery items.',
        variant: 'destructive',
      });
    }
  };

  // Test admin role function
  const testAdminRole = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('test-admin-role', {
        body: {}
      });

      if (error) throw error;

      console.log('Admin role test result:', data);
      alert(`Admin test result: ${JSON.stringify(data, null, 2)}`);
    } catch (error: any) {
      console.error('Error testing admin role:', error);
      alert(`Admin test error: ${error.message}`);
    }
  };

  const syncInstagramPosts = async () => {
    setIsSyncing(true);
    try {
      console.log('Starting Instagram sync...');
      const { data, error } = await supabase.functions.invoke('sync-instagram-data');
      
      console.log('Instagram sync response:', { data, error });
      
      if (error) {
        console.error('Instagram sync error:', error);
        throw error;
      }
      
      await loadSocialPosts();
      await loadGallery();
      toast({
        title: 'Success',
        description: `Instagram posts synced successfully! ${data?.posts_synced || 0} posts processed.`,
      });
    } catch (error: any) {
      console.error('Error syncing Instagram:', error);
      toast({
        title: 'Error',
        description: `Failed to sync Instagram posts: ${error.message || 'Check API configuration.'}`,
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const syncLinkedInPosts = async () => {
    setIsSyncing(true);
    try {
      console.log('Starting LinkedIn sync...');
      const { data, error } = await supabase.functions.invoke('sync-linkedin-data', {
        body: { action: 'sync_posts' }
      });
      
      console.log('LinkedIn sync response:', { data, error });
      
      if (error) {
        console.error('LinkedIn sync error:', error);
        throw error;
      }
      
      await loadSocialPosts();
      toast({
        title: 'Success',
        description: `LinkedIn posts synced successfully! ${data?.posts_synced || 0} posts processed.`,
      });
    } catch (error: any) {
      console.error('Error syncing LinkedIn:', error);
      toast({
        title: 'Error',
        description: `Failed to sync LinkedIn posts: ${error.message || 'Check API configuration.'}`,
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const syncLinkedInFeed = async () => {
    setIsSyncing(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to sync LinkedIn feed.',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('sync-linkedin-feed', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: 'Success',
        description: `LinkedIn feed synced! ${data?.inserted || 0} posts processed.`,
      });
      await loadSocialPosts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sync LinkedIn feed.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleMobileUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('category', uploadForm.category);
      formData.append('instagram_post_id', uploadForm.instagram_post_id);

      const { error } = await supabase.functions.invoke('mobile-upload', {
        body: formData
      });

      if (error) throw error;

      await loadGallery();
      setSelectedFile(null);
      setUploadForm({
        title: '',
        description: '',
        category: 'general',
        instagram_post_id: ''
      });

      toast({
        title: 'Success',
        description: 'Photo uploaded successfully!',
      });
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload photo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePostVisibility = async (id: string, isVisible: boolean) => {
    try {
      const { error } = await supabase
        .from('social_media_posts')
        .update({ is_visible: !isVisible })
        .eq('id', id);

      if (error) throw error;
      await loadSocialPosts();
    } catch (error: any) {
      console.error('Error updating post visibility:', error);
    }
  };

  const updateApprovalStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('social_media_posts')
        .update({ 
          approval_status: status,
          is_visible: status === 'approved'
        })
        .eq('id', id);

      if (error) throw error;
      await loadSocialPosts();
      
      toast({
        title: 'Success',
        description: `Post ${status} successfully!`,
      });
    } catch (error: any) {
      console.error('Error updating approval status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update post approval status.',
        variant: 'destructive',
      });
    }
  };

  const togglePostFeatured = async (id: string, isFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('social_media_posts')
        .update({ is_featured: !isFeatured })
        .eq('id', id);

      if (error) throw error;
      await loadSocialPosts();
    } catch (error: any) {
      console.error('Error updating post featured status:', error);
    }
  };

  const publishToSocial = async () => {
    if (!publishForm.content.trim()) {
      toast({
        title: 'Error',
        description: 'Content is required for publishing.',
        variant: 'destructive',
      });
      return;
    }

    setIsPublishing(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('You must be logged in to publish content');
      }

      const functionName = publishForm.platform === 'linkedin' ? 'publish-to-linkedin' : 'publish-to-instagram';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          title: publishForm.title,
          content: publishForm.content,
          image_url: publishForm.image_url || null,
          article_url: publishForm.article_url || null,
          caption: publishForm.content // For Instagram
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: 'Success',
        description: `Successfully published to ${publishForm.platform}!`,
      });

      // Reset form
      setPublishForm({
        platform: 'linkedin',
        title: '',
        content: '',
        image_url: '',
        article_url: ''
      });

      // Reload posts to show the new published content
      loadSocialPosts();
    } catch (error: any) {
      console.error('Error publishing to social media:', error);
      toast({
        title: 'Error',
        description: error.message || `Failed to publish to ${publishForm.platform}.`,
        variant: 'destructive',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const shareArticleToSocial = async (articleId: string, platform: 'linkedin' | 'instagram') => {
    try {
      // First, get the article details
      const { data: article, error: articleError } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (articleError || !article) {
        throw new Error('Article not found');
      }

      // Prepare content for sharing
      const content = `${article.title}\n\n${article.content.substring(0, 500)}${article.content.length > 500 ? '...' : ''}`;
      const articleUrl = `${window.location.origin}/articles/${articleId}`;

      setPublishForm({
        platform,
        title: article.title,
        content,
        image_url: '',
        article_url: articleUrl
      });

      toast({
        title: 'Article Loaded',
        description: `Article content loaded for ${platform} sharing. Review and publish below.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load article for sharing.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Sync Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Social Media Sync
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              disabled={true}
              variant="outline"
              className="flex items-center gap-2 opacity-50"
            >
              <Instagram className="h-4 w-4" />
              Instagram Sync (Authorization Pending)
            </Button>
            <Button
              disabled={true}
              variant="outline"
              className="flex items-center gap-2 opacity-50"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn Sync (Authorization Pending)
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              onClick={testAdminRole}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Test Admin Role
            </Button>
            <Button
              onClick={syncLinkedInPosts}
              disabled={isSyncing}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Linkedin className="h-4 w-4" />
              {isSyncing ? 'Syncing...' : 'Sync LinkedIn (Legacy)'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* LinkedIn OAuth Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Linkedin className="h-5 w-5" />
            LinkedIn Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <LinkedInConnectionStatus />
        </CardContent>
      </Card>

        {/* Publishing to Social Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Publish to Social Media
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platform">Platform</Label>
                <select
                  id="platform"
                  value={publishForm.platform}
                  onChange={(e) => setPublishForm({ ...publishForm, platform: e.target.value as 'linkedin' | 'instagram' })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="linkedin">LinkedIn</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  value={publishForm.title}
                  onChange={(e) => setPublishForm({ ...publishForm, title: e.target.value })}
                  placeholder="Post title..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={publishForm.content}
                onChange={(e) => setPublishForm({ ...publishForm, content: e.target.value })}
                placeholder="Write your post content here..."
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="image_url">Image URL (Optional)</Label>
                <Input
                  id="image_url"
                  value={publishForm.image_url}
                  onChange={(e) => setPublishForm({ ...publishForm, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <Label htmlFor="article_url">Article URL (Optional)</Label>
                <Input
                  id="article_url"
                  value={publishForm.article_url}
                  onChange={(e) => setPublishForm({ ...publishForm, article_url: e.target.value })}
                  placeholder="https://example.com/article"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={publishToSocial} 
                disabled={isPublishing || !publishForm.content.trim()}
                className="flex items-center gap-2"
              >
                {isPublishing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : publishForm.platform === 'linkedin' ? (
                  <Linkedin className="h-4 w-4" />
                ) : (
                  <Instagram className="h-4 w-4" />
                )}
                {isPublishing ? 'Publishing...' : `Publish to ${publishForm.platform}`}
              </Button>

              {publishForm.content && (
                <Button 
                  variant="outline"
                  onClick={() => setPublishForm({ 
                    platform: 'linkedin',
                    title: '',
                    content: '',
                    image_url: '',
                    article_url: ''
                  })}
                >
                  Clear
                </Button>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              <p><strong>Note:</strong> Instagram requires an image for posts. LinkedIn accepts text-only posts.</p>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Photo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Mobile Photo Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="photo-upload">Select Photo</Label>
              <Input
                id="photo-upload"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="Photo title"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md"
                >
                  <option value="general">General</option>
                  <option value="events">Events</option>
                  <option value="travel">Travel</option>
                  <option value="professional">Professional</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                placeholder="Photo description"
              />
            </div>

            <div>
              <Label htmlFor="instagram_post_id">Instagram Post ID (optional)</Label>
              <Input
                id="instagram_post_id"
                value={uploadForm.instagram_post_id}
                onChange={(e) => setUploadForm({ ...uploadForm, instagram_post_id: e.target.value })}
                placeholder="Link to Instagram post"
              />
            </div>

            <Button
              onClick={handleMobileUpload}
              disabled={!selectedFile || isLoading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isLoading ? 'Uploading...' : 'Upload Photo'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Posts ({socialPosts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {socialPosts.map((post) => (
              <div
                key={post.id}
                className="flex gap-4 p-4 border border-border rounded-lg"
              >
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt={post.title || 'Post image'}
                    className="w-20 h-20 object-cover rounded"
                  />
                )}
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {post.platform === 'instagram' ? (
                      <Instagram className="h-4 w-4 text-pink-500" />
                    ) : (
                      <Linkedin className="h-4 w-4 text-blue-500" />
                    )}
                    <Badge variant="outline">
                      {post.platform}
                    </Badge>
                    <Badge 
                      variant={
                        post.approval_status === 'approved' ? 'default' : 
                        post.approval_status === 'rejected' ? 'destructive' : 'secondary'
                      }
                    >
                      {post.approval_status === 'approved' && <Check className="h-3 w-3 mr-1" />}
                      {post.approval_status === 'rejected' && <X className="h-3 w-3 mr-1" />}
                      {post.approval_status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {post.approval_status}
                    </Badge>
                    {post.is_featured && (
                      <Badge variant="default">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  {post.title && (
                    <h4 className="font-medium">{post.title}</h4>
                  )}
                  
                  {post.content && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.content}
                    </p>
                  )}
                  
                  {post.engagement_data && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {post.engagement_data.likes && (
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {post.engagement_data.likes}
                        </span>
                      )}
                      {post.engagement_data.comments && (
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {post.engagement_data.comments}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {post.published_at && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.published_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  {post.approval_status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => updateApprovalStatus(post.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateApprovalStatus(post.id, 'rejected')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  {post.approval_status === 'approved' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePostVisibility(post.id, post.is_visible)}
                      >
                        {post.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePostFeatured(post.id, post.is_featured)}
                      >
                        <Star className={`h-4 w-4 ${post.is_featured ? 'fill-current' : ''}`} />
                      </Button>
                    </>
                  )}
                  
                  {post.post_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={post.post_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gallery Items */}
      <Card>
        <CardHeader>
          <CardTitle>Photo Gallery ({galleryItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryItems.map((item) => (
              <div key={item.id} className="space-y-2">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded"
                />
                <div className="space-y-1">
                  <h4 className="font-medium">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{item.category}</Badge>
                    {item.is_featured && (
                      <Badge variant="default">Featured</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};