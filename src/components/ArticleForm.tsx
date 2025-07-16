import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, X, Webhook, Link, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: "Strategy" | "Geopolitics" | "Philosophy" | "Defense & Aerospace";
  heroImage: string;
  publishDate: string;
  readTime: number;
  linkedinUrl: string;
  featured: boolean;
  vipPhotos?: string[];
  eventPhotos?: string[];
}

interface ArticleFormProps {
  article?: Article;
  onSave: (article: Article) => void;
  onCancel: () => void;
}

export function ArticleForm({ article, onSave, onCancel }: ArticleFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [zapierWebhook, setZapierWebhook] = useState("");
  const [formData, setFormData] = useState({
    title: article?.title || "",
    excerpt: article?.excerpt || "",
    content: article?.content || "",
    category: article?.category || "Strategy" as const,
    heroImage: article?.heroImage || "",
    publishDate: article?.publishDate || new Date().toISOString().split('T')[0],
    readTime: article?.readTime || 5,
    linkedinUrl: article?.linkedinUrl || "",
    featured: article?.featured || false,
    vipPhotos: article?.vipPhotos || [],
    eventPhotos: article?.eventPhotos || []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newArticle: Article = {
        id: article?.id || Date.now().toString(),
        ...formData
      };

      onSave(newArticle);

      // Trigger Zapier webhook if provided
      if (zapierWebhook) {
        try {
          await fetch(zapierWebhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: "no-cors",
            body: JSON.stringify({
              action: "article_published",
              article: newArticle,
              timestamp: new Date().toISOString()
            })
          });

          toast({
            title: "Article Saved & Synced",
            description: "Article saved and Zapier webhook triggered successfully.",
          });
        } catch (error) {
          toast({
            title: "Article Saved",
            description: "Article saved, but webhook failed. Check your Zapier settings.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Article Saved",
          description: "Article has been saved successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save article. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content,
      readTime: estimateReadTime(content)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {article ? "Edit Article" : "Add New Article"}
          </h2>
          <p className="text-muted-foreground">
            Create and manage your strategic insights and LinkedIn articles
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <span>Est. {formData.readTime} min read</span>
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Article Details</CardTitle>
            <CardDescription>
              Basic information about your article
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter article title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Strategy">Strategy</SelectItem>
                    <SelectItem value="Geopolitics">Geopolitics</SelectItem>
                    <SelectItem value="Philosophy">Philosophy</SelectItem>
                    <SelectItem value="Defense & Aerospace">Defense & Aerospace</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt *</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Brief description of the article"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="publishDate">Publish Date</Label>
                <Input
                  id="publishDate"
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                  placeholder="https://linkedin.com/pulse/..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroImage">Hero Image URL</Label>
              <Input
                id="heroImage"
                value={formData.heroImage}
                onChange={(e) => setFormData(prev => ({ ...prev, heroImage: e.target.value }))}
                placeholder="https://example.com/image.jpg or /api/placeholder/1200/600"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
              />
              <Label htmlFor="featured">Feature in hero rotation</Label>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Article Content</CardTitle>
            <CardDescription>
              Full article content and media
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Write your full article content here..."
                rows={12}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vipPhotos">VIP Photos (comma-separated URLs)</Label>
                <Textarea
                  id="vipPhotos"
                  value={formData.vipPhotos.join(", ")}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    vipPhotos: e.target.value.split(",").map(url => url.trim()).filter(Boolean)
                  }))}
                  placeholder="URL1, URL2, URL3..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventPhotos">Event Photos (comma-separated URLs)</Label>
                <Textarea
                  id="eventPhotos"
                  value={formData.eventPhotos.join(", ")}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    eventPhotos: e.target.value.split(",").map(url => url.trim()).filter(Boolean)
                  }))}
                  placeholder="URL1, URL2, URL3..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auto-Sync Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Auto-Sync with LinkedIn
            </CardTitle>
            <CardDescription>
              Configure Zapier webhook for automatic article synchronization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="zapierWebhook">Zapier Webhook URL (Optional)</Label>
              <Input
                id="zapierWebhook"
                type="url"
                value={zapierWebhook}
                onChange={(e) => setZapierWebhook(e.target.value)}
                placeholder="https://hooks.zapier.com/hooks/catch/..."
              />
              <p className="text-sm text-muted-foreground">
                Create a Zap with webhook trigger to auto-sync when you publish articles
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Article"}
          </Button>
        </div>
      </form>
    </div>
  );
}