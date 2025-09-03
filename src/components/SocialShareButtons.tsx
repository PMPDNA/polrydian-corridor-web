import React from 'react';
import { Button } from "@/components/ui/button";
import { Share2, ExternalLink, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SocialShareButtonsProps {
  article: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    heroImage?: string;
  };
  compact?: boolean;
}

export function SocialShareButtons({ article, compact = false }: SocialShareButtonsProps) {
  const { toast } = useToast();
  // Use environment variable or fallback, avoiding window.location.origin for SSR compatibility
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://polrydian.com';
  const articleUrl = `${baseUrl}/articles/${article.slug}`;
  
  const shareToLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
  };

  const shareToReddit = () => {
    const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(articleUrl)}&title=${encodeURIComponent(article.title)}`;
    window.open(redditUrl, '_blank', 'width=600,height=400');
  };

  const shareToSubstack = () => {
    // Copy content for Substack (manual posting)
    const content = `${article.title}\n\n${article.excerpt}\n\nRead more: ${articleUrl}`;
    navigator.clipboard.writeText(content);
    toast({
      title: "Content Copied",
      description: "Article content copied for Substack posting",
    });
  };

  const shareToInstagram = () => {
    // For Instagram, we'll copy the content and open Instagram
    const content = `${article.title}\n\n${article.excerpt}\n\nLink in bio 📎`;
    navigator.clipboard.writeText(content);
    window.open('https://instagram.com', '_blank');
    toast({
      title: "Content Copied",
      description: "Caption copied for Instagram posting",
    });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      toast({
        title: "Link Copied",
        description: "Article link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: articleUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyLink();
    }
  };

  if (compact) {
    return (
      <div className="flex gap-1">
        <Button size="sm" variant="outline" onClick={nativeShare}>
          <Share2 className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="outline" onClick={shareToLinkedIn}>
          LinkedIn
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        size="sm" 
        onClick={shareToLinkedIn}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <ExternalLink className="h-4 w-4 mr-1" />
        LinkedIn
      </Button>
      
      <Button 
        size="sm" 
        onClick={shareToReddit}
        className="bg-orange-600 hover:bg-orange-700 text-white"
      >
        <ExternalLink className="h-4 w-4 mr-1" />
        Reddit
      </Button>
      
      <Button 
        size="sm" 
        variant="outline"
        onClick={shareToSubstack}
      >
        Substack
      </Button>
      
      <Button 
        size="sm" 
        variant="outline"
        onClick={shareToInstagram}
      >
        Instagram
      </Button>
      
      <Button 
        size="sm" 
        variant="ghost"
        onClick={copyLink}
      >
        <Copy className="h-4 w-4 mr-1" />
        Copy Link
      </Button>
    </div>
  );
}