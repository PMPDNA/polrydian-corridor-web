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
import { Save, X, Link, Upload, Image as ImageIcon } from "lucide-react";
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
        // Use direct category field if available, fallback to first keyword for legacy compatibility
        const directCategory = (article as any).category;
        const legacyCategory = (article as any).keywords?.[0];
        return directCategory || legacyCategory || "Strategy";
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
    featured: getArticleField('featured', false)
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
          content: validatedData.content, // Already sanitized and cleaned by sanitizeFormData
          meta_description: validatedData.excerpt,
          featured_image: formData.heroImage,
          reading_time_minutes: formData.readTime,
          keywords: [formData.category], // Maintain backward compatibility
          category: formData.category, // Store as direct field for consistency
          linkedin_url: formData.linkedinUrl,
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('ArticleForm: About to save content:', {
          originalLength: formData.content.length,
          sanitizedLength: validatedData.content.length,
          hasCorruption: /([a-z])\1{3,}/.test(formData.content)
        });
        
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
            content: validatedData.content, // Already sanitized by sanitizeFormData
            meta_description: validatedData.excerpt,
            featured_image: formData.heroImage,
            reading_time_minutes: formData.readTime,
            keywords: [formData.category], // Maintain backward compatibility
            category: formData.category, // Store as direct field for consistency
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

      // Handle hero image association if uploaded
      if (formData.heroImage) {
        await supabase
          .from('images')
          .upsert({
            file_path: formData.heroImage,
            name: `${formData.title} - hero`,
            category: 'hero',
            uploaded_by: user.id,
            file_type: 'image/jpeg',
            is_public: true
          }, { onConflict: 'file_path' });
      }

      toast({
        title: "Article Published!",
        description: "Your article has been saved successfully.",
      });
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