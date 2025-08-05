import { AdminLayout } from "@/layouts/AdminLayout";
import { StandardizedImageUpload } from "@/components/StandardizedImageUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ImageIcon, 
  Trash2, 
  Download, 
  ExternalLink,
  FolderOpen,
  BarChart3
} from "lucide-react";

interface ImageRecord {
  id: string;
  name: string;
  file_path: string;
  category: string;
  file_size: number;
  created_at: string;
  is_public: boolean;
}

export default function ImageManager() {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  const categories = [
    { id: 'all', label: 'All Images', count: 0 },
    { id: 'logos', label: 'Organization Logos', count: 0 },
    { id: 'articles', label: 'Article Images', count: 0 },
    { id: 'avatars', label: 'User Avatars', count: 0 },
    { id: 'general', label: 'General Images', count: 0 },
  ];

  const loadImages = async () => {
    try {
      let query = supabase
        .from('images')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;

      setImages(data || []);
    } catch (error) {
      console.error('Error loading images:', error);
      toast({
        title: "Error Loading Images",
        description: "Failed to load images from database",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (imageId: string, filePath: string) => {
    try {
      // Extract filename from full path
      const fileName = filePath.split('/').pop();
      if (!fileName) throw new Error('Invalid file path');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('images')
        .remove([fileName]);

      if (storageError) {
        console.warn('Storage deletion failed:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      toast({
        title: "Image Deleted",
        description: "Image removed from storage and database",
      });

      loadImages(); // Reload list
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryCounts = () => {
    const counts = images.reduce((acc, img) => {
      acc[img.category] = (acc[img.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return categories.map(cat => ({
      ...cat,
      count: cat.id === 'all' ? images.length : (counts[cat.id] || 0)
    }));
  };

  useEffect(() => {
    loadImages();
  }, [selectedCategory]);

  return (
    <AdminLayout title="Image Manager">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Image Storage Management</h2>
            <p className="text-muted-foreground">
              Centralized image upload and organization system
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            {images.length} Total Images
          </Badge>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {getCategoryCounts().map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <FolderOpen className="h-4 w-4" />
              {category.label}
              <Badge variant="secondary" className="ml-1">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Upload Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StandardizedImageUpload
            title="Organization Logos"
            description="Upload company and partner logos"
            category="logos"
            multiple={true}
            maxFiles={20}
            maxSize={5}
            onFilesChange={(urls) => {
              toast({
                title: "Logos Uploaded",
                description: `${urls.length} logo(s) uploaded successfully`,
              });
              loadImages();
            }}
          />

          <StandardizedImageUpload
            title="Article Images"
            description="Featured images and article content"
            category="articles"
            multiple={true}
            maxFiles={50}
            maxSize={10}
            onFilesChange={(urls) => {
              toast({
                title: "Article Images Uploaded",
                description: `${urls.length} image(s) uploaded successfully`,
              });
              loadImages();
            }}
          />
        </div>

        {/* Image Gallery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Image Gallery
              {selectedCategory !== 'all' && (
                <Badge variant="outline">
                  {categories.find(c => c.id === selectedCategory)?.label}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading images...
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No images found in this category
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {images.map((image) => (
                  <Card key={image.id} className="overflow-hidden group">
                    <div className="aspect-square relative">
                      <img
                        src={image.file_path}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300" />
                      
                      {/* Action Buttons */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-1">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8"
                          onClick={() => window.open(image.file_path, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="h-8 w-8"
                          onClick={() => deleteImage(image.id, image.file_path)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <CardContent className="p-3">
                      <p className="text-xs font-medium truncate mb-1">
                        {image.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {image.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(image.file_size)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(image.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}