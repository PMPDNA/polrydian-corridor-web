import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Linkedin, Instagram, Share } from 'lucide-react';

interface ArticleShareButtonsProps {
  articleId: string;
  title: string;
  content: string;
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline' | 'secondary';
}

export const ArticleShareButtons = ({ 
  articleId, 
  title, 
  content, 
  size = 'sm',
  variant = 'outline'
}: ArticleShareButtonsProps) => {
  const { toast } = useToast();

  const shareToSocial = async (platform: 'linkedin' | 'instagram') => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to share articles to social media.',
          variant: 'destructive',
        });
        return;
      }

      // Check if user has admin role
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);

      const hasAdminRole = userRoles?.some(role => role.role === 'admin');

      if (roleError || !hasAdminRole) {
        toast({
          title: 'Admin Access Required',
          description: 'Only admins can publish content to social media.',
          variant: 'destructive',
        });
        return;
      }

      // Prepare content for sharing
      const shareContent = `${title}\n\n${content.substring(0, 400)}${content.length > 400 ? '...' : ''}`;
      const articleUrl = `${window.location.origin}/articles/${articleId}`;

      const functionName = platform === 'linkedin' ? 'publish-to-linkedin' : 'publish-to-instagram';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          title: title,
          content: shareContent,
          article_url: articleUrl,
          caption: shareContent // For Instagram
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
        description: `Article shared to ${platform} successfully!`,
      });

    } catch (error: any) {
      console.error(`Error sharing to ${platform}:`, error);
      toast({
        title: 'Error',
        description: error.message || `Failed to share to ${platform}.`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        size={size}
        variant={variant}
        onClick={() => shareToSocial('linkedin')}
        className="flex items-center gap-2"
        title="Share to LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
        LinkedIn
      </Button>
      
      <Button
        size={size}
        variant={variant}
        onClick={() => shareToSocial('instagram')}
        className="flex items-center gap-2"
        title="Share to Instagram"
      >
        <Instagram className="h-4 w-4" />
        Instagram
      </Button>
    </div>
  );
};