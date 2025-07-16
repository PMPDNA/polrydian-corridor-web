import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Instagram, 
  Linkedin, 
  ExternalLink,
  Heart,
  MessageCircle,
  Calendar,
  Eye
} from 'lucide-react';

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
}

interface SocialMediaFeedProps {
  showFeaturedOnly?: boolean;
  limit?: number;
  platform?: 'instagram' | 'linkedin' | 'all';
  showTitle?: boolean;
}

export const SocialMediaFeed: React.FC<SocialMediaFeedProps> = ({
  showFeaturedOnly = false,
  limit = 12,
  platform = 'all',
  showTitle = true
}) => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, [showFeaturedOnly, limit, platform]);

  const loadPosts = async () => {
    try {
      let query = supabase
        .from('social_media_posts')
        .select('*')
        .eq('is_visible', true)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (showFeaturedOnly) {
        query = query.eq('is_featured', true);
      }

      if (platform !== 'all') {
        query = query.eq('platform', platform);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading social posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted h-48 rounded-t-lg"></div>
            <div className="bg-muted/50 h-20 rounded-b-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="py-12">
      {showTitle && (
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Social Media Insights
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Follow my latest thoughts and insights across LinkedIn and Instagram
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {post.image_url && (
              <div className="relative">
                <img
                  src={post.image_url}
                  alt={post.title || 'Social media post'}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2">
                  {post.platform === 'instagram' ? (
                    <Badge className="bg-pink-500 hover:bg-pink-600">
                      <Instagram className="h-3 w-3 mr-1" />
                      Instagram
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-500 hover:bg-blue-600">
                      <Linkedin className="h-3 w-3 mr-1" />
                      LinkedIn
                    </Badge>
                  )}
                </div>
                {post.is_featured && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">Featured</Badge>
                  </div>
                )}
              </div>
            )}

            <CardContent className="p-4 space-y-3">
              {post.title && (
                <h3 className="font-semibold text-foreground line-clamp-2">
                  {post.title}
                </h3>
              )}

              {post.content && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {post.content}
                </p>
              )}

              {post.hashtags && post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.hashtags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-accent/10 text-accent px-2 py-1 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                  {post.hashtags.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{post.hashtags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {post.engagement_data?.likes && (
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {post.engagement_data.likes}
                    </span>
                  )}
                  {post.engagement_data?.comments && (
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {post.engagement_data.comments}
                    </span>
                  )}
                  {post.published_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.published_at).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {post.post_url && (
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={post.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No social media posts available yet.</p>
        </div>
      )}
    </section>
  );
};