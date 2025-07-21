import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface LinkedInPost {
  id: string;
  title: string;
  content: string;
  published_at: string;
  visibility: string;
  linkedin_id: string;
}

export const LinkedInFeed = () => {
  const [posts, setPosts] = useState<LinkedInPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    loadLinkedInData();
  }, []);

  const loadLinkedInData = async () => {
    try {
      // Load LinkedIn posts from the new linkedin_posts table
      const { data: posts, error } = await supabase
        .from('linkedin_posts')
        .select('*')
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      // Transform the data to match the expected format
      const transformedPosts = posts?.map(post => ({
        id: post.id,
        title: post.message?.substring(0, 100) + '...' || 'LinkedIn Post',
        content: post.message || '',
        published_at: post.created_at,
        visibility: 'PUBLIC',
        linkedin_id: post.id
      })) || [];

      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error loading LinkedIn data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="w-full">
            <CardHeader className="space-y-2">
              <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-1/2 h-3 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="w-full h-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-5/6 h-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-4/6 h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#0077B5] rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">in</span>
            </div>
            <span>LinkedIn Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No LinkedIn articles available at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#0077B5] rounded flex items-center justify-center">
            <span className="text-white font-bold">in</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Latest LinkedIn Insights</h3>
            <p className="text-sm text-muted-foreground">Professional thoughts and analysis</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open('https://linkedin.com/in/patrick-misiewicz', '_blank')}
          className="flex items-center space-x-2"
        >
          <ExternalLink className="w-4 h-4" />
          <span>View LinkedIn Profile</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="w-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src="/patrick-profile.jpg" alt="Patrick Misiewicz" />
                    <AvatarFallback>PM</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Patrick Misiewicz</p>
                    <p className="text-sm text-muted-foreground">Founder & Strategic Advisor</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-[#0077B5]/10 text-[#0077B5] border-[#0077B5]/20">
                  <Users className="w-3 h-3 mr-1" />
                  Public
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg leading-tight mb-2">{post.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {truncateContent(post.content)}
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(post.published_at)}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://linkedin.com/posts/${post.linkedin_id}`, '_blank')}
                  className="text-[#0077B5] hover:text-[#0077B5]/80 hover:bg-[#0077B5]/10"
                >
                  Read More
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};