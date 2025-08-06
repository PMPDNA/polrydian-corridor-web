import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Save, X, Webhook, Link, Upload, Image as ImageIcon } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { ImageGalleryPicker } from "@/components/ImageGalleryPicker";
import { useToast } from "@/hooks/use-toast";
import { articleSchema, sanitizeHtml, sanitizeFormData, isValidUrl } from "@/lib/security";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/integrations/supabase/client";
import { useArticles, type Article as DBArticle } from "@/hooks/useArticles";
import { RichTextEditor } from "@/components/RichTextEditor";

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
  article?: Article | DBArticle;
  onSave: (article: Article | DBArticle) => void;
  onCancel: () => void;
}

export function ArticleForm({ article, onSave, onCancel }: ArticleFormProps) {
  const { toast } = useToast();
  const { isAdmin, user } = useSupabaseAuth();
  const { createArticle, updateArticle } = useArticles();
  const [isLoading, setIsLoading] = useState(false);
  const [zapierWebhook, setZapierWebhook] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Handle both legacy Article interface and new DBArticle interface
  const getArticleField = (field: string, fallback: any = "") => {
    if (!article) return fallback;
    
    // Map fields between interfaces
    switch (field) {
      case 'excerpt':
        return 'meta_description' in article ? article.meta_description : (article as any).excerpt || fallback;
      case 'publishDate':
        return 'created_at' in article ? new Date(article.created_at).toISOString().split('T')[0] : (article as any).publishDate || fallback;
      case 'readTime':
        return 'reading_time_minutes' in article ? article.reading_time_minutes : (article as any).readTime || fallback;
      case 'heroImage':
        return 'featured_image' in article ? article.featured_image : (article as any).heroImage || fallback;
      case 'category':
        // Look for category in keywords array first, then fallback
        const dbKeywords = (article as any).keywords;
        console.log('ArticleForm: Reading category from article:', { dbKeywords, article: article });
        if (dbKeywords && Array.isArray(dbKeywords) && dbKeywords.length > 0) {
          console.log('ArticleForm: Found category in keywords:', dbKeywords[0]);
          return dbKeywords[0];
        }
        const fallbackCategory = (article as any).category || "Strategy";
        console.log('ArticleForm: Using fallback category:', fallbackCategory);
        return fallbackCategory;
      case 'linkedinUrl':
        return 'linkedin_url' in article ? article.linkedin_url : (article as any).linkedinUrl || fallback;
      default:
        return (article as any)[field] || fallback;
    }
  };

  const [formData, setFormData] = useState({
    title: getArticleField('title'),
    excerpt: getArticleField('excerpt'),
    content: getArticleField('content'),
    category: getArticleField('category', "Strategy") as "Strategy" | "Geopolitics" | "Philosophy" | "Defense & Aerospace",
    heroImage: getArticleField('heroImage'),
    publishDate: getArticleField('publishDate', new Date().toISOString().split('T')[0]),
    readTime: getArticleField('readTime', 5),
    linkedinUrl: getArticleField('linkedinUrl'),
    featured: getArticleField('featured', false),
    vipPhotos: getArticleField('vipPhotos', []),
    eventPhotos: getArticleField('eventPhotos', [])
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    console.log('ArticleForm: Starting submit with formData:', {
      title: formData.title,
      category: formData.category,
      excerpt: formData.excerpt,
      contentLength: formData.content.length,
      contentPreview: formData.content.substring(0, 100) + '...',
      linkedinUrl: formData.linkedinUrl,
      article: article ? { id: article.id, title: article.title } : null
    });

    // Check admin privileges
    if (!isAdmin || !user) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to publish articles.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    try {
      // Sanitize input data
      const sanitizedData = sanitizeFormData({
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        featured: formData.featured,
        zapierWebhookUrl: zapierWebhook
      });
      
      console.log('ArticleForm: After sanitization - content length:', sanitizedData.content.length);
      
      // Validate with Zod schema  
      const validationResult = articleSchema.safeParse(sanitizedData);
      
      if (!validationResult.success) {
        const fieldErrors: Record<string, string> = {};
        validationResult.error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        setIsLoading(false);
        return;
      }

      const validatedData = validationResult.data;
      
      // Save to Supabase database
      if (article && 'id' in article && article.id) {
        console.log('ArticleForm: Updating existing article with ID:', article.id);
        console.log('ArticleForm: Saving with category:', formData.category);
        
        // Update all fields in one go - using direct formData values
        const updatePayload = {
          title: validatedData.title,
          content: sanitizeHtml(validatedData.content),
          meta_description: validatedData.excerpt,
          featured_image: formData.heroImage,
          reading_time_minutes: formData.readTime,
          keywords: [formData.category], // This should be the current formData.category
          linkedin_url: formData.linkedinUrl,
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('ArticleForm: Update payload keywords:', updatePayload.keywords);
        
        const { data: updated, error: updateError } = await supabase
          .from('articles')
          .update(updatePayload)
          .eq('id', article.id)
          .select()
          .single();
        
        console.log('ArticleForm: Update result:', { updated, updateError });
        
        if (updateError) {
          console.error('Error updating article:', updateError);
          throw updateError;
        }
        
        if (updated) {
          console.log('ArticleForm: Article updated successfully:', updated);
          toast({
            title: "Article Updated",
            description: "Your article has been updated successfully.",
          });
          onSave(updated as any);
        }
      } else {
        console.log('ArticleForm: Creating new article');
        
        // Create new article with all fields at once
        const { data: created, error: createError } = await supabase
          .from('articles')
          .insert({
            title: validatedData.title,
            content: sanitizeHtml(validatedData.content),
            meta_description: validatedData.excerpt,
            featured_image: formData.heroImage,
            reading_time_minutes: formData.readTime,
            keywords: [formData.category],
            linkedin_url: formData.linkedinUrl,
            status: 'published',
            published_at: new Date().toISOString(),
            user_id: user.id
          })
          .select()
          .single();
        
        console.log('ArticleForm: Create result:', { created, createError });
        
        if (createError) {
          console.error('Error creating article:', createError);
          throw createError;
        }
        
        if (created) {
          console.log('ArticleForm: Article created successfully:', created);
          toast({
            title: "Article Created",
            description: "Your article has been created successfully.",
          });
          onSave(created as any);
        }
      }

      // Handle image associations if images were uploaded
      if (formData.heroImage || formData.vipPhotos.length > 0 || formData.eventPhotos.length > 0) {
        const allImages = [
          ...(formData.heroImage ? [{ url: formData.heroImage, category: 'hero' }] : []),
          ...formData.vipPhotos.map(url => ({ url, category: 'vip' })),
          ...formData.eventPhotos.map(url => ({ url, category: 'event' }))
        ];

        // Store image associations
        for (const image of allImages) {
          await supabase
            .from('images')
            .upsert({
              file_path: image.url,
              name: `${formData.title} - ${image.category}`,
              category: image.category,
              uploaded_by: user.id,
              file_type: 'image/jpeg',
              is_public: true
            }, { onConflict: 'file_path' });
        }
      }

      // Trigger Zapier webhook if provided and valid
      if (zapierWebhook && isValidUrl(zapierWebhook)) {
        try {
          await fetch(zapierWebhook, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "User-Agent": "PolrydianApp/1.0"
            },
            body: JSON.stringify({
              action: "article_published",
              article: {
                title: validatedData.title,
                content: sanitizeHtml(validatedData.content),
                excerpt: validatedData.excerpt
              },
              timestamp: new Date().toISOString()
            })
          });

          toast({
            title: "Article Published & Synced",
            description: "Article saved to database and Zapier webhook triggered.",
          });
        } catch (error) {
          toast({
            title: "Article Published",
            description: "Article saved to database, but webhook failed. Check URL security.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Article Published!",
          description: "Your article has been saved successfully.",
        });
      }
    } catch (error: any) {
      console.error('Error saving article:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save article. Please try again.",
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
    <div className="w-full max-w-none space-y-6 p-6 max-h-[85vh] overflow-y-auto">
      <div className="sticky top-0 bg-background z-10 pb-4 border-b">
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
                  maxLength={200}
                />
                {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => {
                    console.log('ArticleForm: Category changed from', formData.category, 'to', value);
                    setFormData(prev => ({ ...prev, category: value as any }));
                  }}
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
                maxLength={500}
              />
              {errors.excerpt && <p className="text-sm text-destructive mt-1">{errors.excerpt}</p>}
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
              <Label htmlFor="heroImage">Hero Image</Label>
              <div className="space-y-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" type="button" className="w-full">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Choose from Gallery
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Choose Hero Image</DialogTitle>
                    </DialogHeader>
                    <ImageGalleryPicker
                      onImageSelect={(url) => setFormData(prev => ({ ...prev, heroImage: url }))}
                      selectedImage={formData.heroImage}
                      category="hero"
                      multiple={false}
                    />
                  </DialogContent>
                </Dialog>
                
                <FileUpload
                  onFilesChange={(urls) => setFormData(prev => ({ ...prev, heroImage: urls[0] || "" }))}
                  currentFiles={formData.heroImage ? [formData.heroImage] : []}
                  multiple={false}
                  label="Or Upload New Image"
                  className="mb-4"
                />
                
                <Input
                  id="heroImage"
                  value={formData.heroImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, heroImage: e.target.value }))}
                  placeholder="Or enter image URL directly"
                />
              </div>
              
              {formData.heroImage && (
                <div className="mt-2">
                  <img 
                    src={formData.heroImage} 
                    alt="Hero preview"
                    className="max-w-xs h-32 object-cover rounded border"
                  />
                </div>
              )}
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
              <RichTextEditor
                value={formData.content}
                onChange={handleContentChange}
                placeholder="Write your full article content here..."
                className="min-h-[400px]"
              />
              {errors.content && <p className="text-sm text-destructive mt-1">{errors.content}</p>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label>VIP Meeting Photos</Label>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" type="button" className="w-full">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Choose VIP Photos ({formData.vipPhotos.length} selected)
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Choose VIP Photos</DialogTitle>
                    </DialogHeader>
                    <ImageGalleryPicker
                      onImageSelect={(url) => setFormData(prev => ({ 
                        ...prev, 
                        vipPhotos: [...prev.vipPhotos, url] 
                      }))}
                      category="vip"
                      multiple={true}
                      maxImages={10}
                    />
                  </DialogContent>
                </Dialog>
                
                <FileUpload
                  onFilesChange={(urls) => setFormData(prev => ({ ...prev, vipPhotos: [...prev.vipPhotos, ...urls] }))}
                  currentFiles={[]}
                  multiple={true}
                  label="Or Upload New VIP Photos"
                />
                
                <div className="space-y-2">
                  <Label htmlFor="vipPhotosText">Or enter URLs (comma-separated)</Label>
                  <Textarea
                    id="vipPhotosText"
                    value={formData.vipPhotos.join(", ")}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      vipPhotos: e.target.value.split(",").map(url => url.trim()).filter(Boolean)
                    }))}
                    placeholder="URL1, URL2, URL3..."
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <Label>Event Photos</Label>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" type="button" className="w-full">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Choose Event Photos ({formData.eventPhotos.length} selected)
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Choose Event Photos</DialogTitle>
                    </DialogHeader>
                    <ImageGalleryPicker
                      onImageSelect={(url) => setFormData(prev => ({ 
                        ...prev, 
                        eventPhotos: [...prev.eventPhotos, url] 
                      }))}
                      category="event"
                      multiple={true}
                      maxImages={10}
                    />
                  </DialogContent>
                </Dialog>
                
                <FileUpload
                  onFilesChange={(urls) => setFormData(prev => ({ ...prev, eventPhotos: [...prev.eventPhotos, ...urls] }))}
                  currentFiles={[]}
                  multiple={true}
                  label="Or Upload New Event Photos"
                />
                
                <div className="space-y-2">
                  <Label htmlFor="eventPhotosText">Or enter URLs (comma-separated)</Label>
                  <Textarea
                    id="eventPhotosText"
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