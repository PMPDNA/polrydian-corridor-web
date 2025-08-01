import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, ExternalLink, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ScheduledPost {
  id: string;
  platform: string;
  scheduled_date: string;
  status: string;
  published_url?: string;
  error_message?: string;
  chapter?: {
    chapter_title: string;
    chapter_number: number;
  };
  article?: {
    title: string;
  };
}

interface Article {
  id: string;
  title: string;
  status: string;
  auto_publish_linkedin: boolean;
  auto_publish_substack: boolean;
  auto_publish_medium: boolean;
  chapter?: {
    chapter_title: string;
    chapter_number: number;
  };
}

export const PublishingPipeline = () => {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [newSchedule, setNewSchedule] = useState({
    article_id: '',
    platform: '',
    scheduled_date: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch scheduled posts
      const { data: postsData, error: postsError } = await supabase
        .from('publishing_schedule')
        .select(`
          *,
          chapter:book_chapters(chapter_title, chapter_number),
          article:articles(title)
        `)
        .order('scheduled_date', { ascending: true });

      if (postsError) throw postsError;
      setScheduledPosts(postsData || []);

      // Fetch articles for scheduling
      const { data: articlesData, error: articlesError } = await supabase
        .from('articles')
        .select(`
          id, title, status, auto_publish_linkedin, auto_publish_substack, auto_publish_medium,
          chapter:book_chapters(chapter_title, chapter_number)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (articlesError) throw articlesError;
      setArticles(articlesData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load publishing data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const schedulePost = async () => {
    if (!newSchedule.article_id || !newSchedule.platform || !newSchedule.scheduled_date) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('publishing_schedule')
        .insert([newSchedule]);

      if (error) throw error;

      toast({ title: "Post scheduled successfully" });
      setNewSchedule({ article_id: '', platform: '', scheduled_date: '' });
      fetchData();
    } catch (error) {
      console.error('Error scheduling post:', error);
      toast({
        title: "Error",
        description: "Failed to schedule post",
        variant: "destructive",
      });
    }
  };

  const updateAutoPublish = async (articleId: string, platform: string, enabled: boolean) => {
    try {
      const field = `auto_publish_${platform}`;
      const { error } = await supabase
        .from('articles')
        .update({ [field]: enabled })
        .eq('id', articleId);

      if (error) throw error;

      toast({ title: `Auto-publish ${enabled ? 'enabled' : 'disabled'} for ${platform}` });
      fetchData();
    } catch (error) {
      console.error('Error updating auto-publish:', error);
      toast({
        title: "Error",
        description: "Failed to update auto-publish setting",
        variant: "destructive",
      });
    }
  };

  const publishNow = async (articleId: string, platform: string) => {
    try {
      // This would trigger the actual publishing logic
      // For now, we'll create a scheduled post for immediate publishing
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('publishing_schedule')
        .insert([{
          article_id: articleId,
          platform: platform,
          scheduled_date: now,
          status: 'publishing'
        }]);

      if (error) throw error;

      toast({ title: `Publishing to ${platform}...` });
      fetchData();
    } catch (error) {
      console.error('Error publishing:', error);
      toast({
        title: "Error",
        description: "Failed to publish",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'publishing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Calendar className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return 'bg-blue-500';
      case 'substack':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading publishing pipeline...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Publishing Pipeline</h1>
        <p className="text-muted-foreground">Manage automated cross-platform content distribution</p>
      </div>

      {/* Schedule New Post */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule New Post</CardTitle>
          <CardDescription>Schedule content for cross-platform publishing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={newSchedule.article_id} onValueChange={(value) => setNewSchedule({ ...newSchedule, article_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select article" />
              </SelectTrigger>
              <SelectContent>
                {articles.map((article) => (
                  <SelectItem key={article.id} value={article.id}>
                    {article.chapter ? `Ch ${article.chapter.chapter_number}: ` : ''}{article.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={newSchedule.platform} onValueChange={(value) => setNewSchedule({ ...newSchedule, platform: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="substack">Substack</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="datetime-local"
              value={newSchedule.scheduled_date}
              onChange={(e) => setNewSchedule({ ...newSchedule, scheduled_date: e.target.value })}
            />

            <Button onClick={schedulePost}>
              <Send className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Auto-Publish Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Auto-Publish Settings</CardTitle>
          <CardDescription>Configure automatic publishing for articles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {articles.map((article) => (
              <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">
                    {article.chapter ? `Chapter ${article.chapter.chapter_number}: ` : ''}{article.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Status: {article.status}
                  </p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={article.auto_publish_linkedin}
                      onCheckedChange={(checked) => updateAutoPublish(article.id, 'linkedin', checked)}
                    />
                    <Label>LinkedIn</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={article.auto_publish_substack}
                      onCheckedChange={(checked) => updateAutoPublish(article.id, 'substack', checked)}
                    />
                    <Label>Substack</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={article.auto_publish_medium}
                      onCheckedChange={(checked) => updateAutoPublish(article.id, 'medium', checked)}
                    />
                    <Label>Medium</Label>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => publishNow(article.id, 'linkedin')}
                    >
                      LinkedIn Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled & Published Posts</CardTitle>
          <CardDescription>Track your content distribution pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scheduledPosts.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No scheduled posts yet</p>
            ) : (
              scheduledPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(post.status)}
                    <div>
                      <h4 className="font-medium">
                        {post.chapter ? `Chapter ${post.chapter.chapter_number}: ${post.chapter.chapter_title}` : post.article?.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.scheduled_date).toLocaleString()}
                      </p>
                      {post.error_message && (
                        <p className="text-sm text-red-500">{post.error_message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={`text-white ${getPlatformColor(post.platform)}`}>
                      {post.platform}
                    </Badge>
                    <Badge variant={post.status === 'completed' ? 'default' : post.status === 'failed' ? 'destructive' : 'secondary'}>
                      {post.status}
                    </Badge>
                    {post.published_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={post.published_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};