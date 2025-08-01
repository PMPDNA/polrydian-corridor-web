import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Image as ImageIcon, Copy, ExternalLink } from 'lucide-react';

interface GalleryImage {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  thumbnail_url?: string;
  category: string;
  is_featured: boolean;
  is_visible: boolean;
  uploaded_by?: string;
  created_at: string;
}

const GALLERY_CATEGORIES = [
  { value: 'all', label: 'All Images' },
  { value: 'general', label: 'General' },
  { value: 'events', label: 'Events' },
  { value: 'meetings', label: 'Meetings' },
  { value: 'conferences', label: 'Conferences' },
  { value: 'social', label: 'Social Media' },
];

export default function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    filterImages();
  }, [images, selectedCategory, searchTerm]);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: "Error",
        description: "Failed to load gallery images",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterImages = () => {
    let filtered = images;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(img => img.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(img => 
        img.title.toLowerCase().includes(term) ||
        (img.description && img.description.toLowerCase().includes(term))
      );
    }

    setFilteredImages(filtered);
  };

  const copyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Image URL copied to clipboard",
    });
  };

  const toggleVisibility = async (imageId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('gallery')
        .update({ is_visible: !currentVisibility })
        .eq('id', imageId);

      if (error) throw error;

      setImages(prevImages => 
        prevImages.map(img => 
          img.id === imageId ? { ...img, is_visible: !currentVisibility } : img
        )
      );

      toast({
        title: "Success",
        description: `Image ${!currentVisibility ? 'shown' : 'hidden'} successfully`,
      });
    } catch (error) {
      console.error('Error updating visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update image visibility",
        variant: "destructive",
      });
    }
  };

  const toggleFeatured = async (imageId: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('gallery')
        .update({ is_featured: !currentFeatured })
        .eq('id', imageId);

      if (error) throw error;

      setImages(prevImages => 
        prevImages.map(img => 
          img.id === imageId ? { ...img, is_featured: !currentFeatured } : img
        )
      );

      toast({
        title: "Success",
        description: `Image ${!currentFeatured ? 'featured' : 'unfeatured'} successfully`,
      });
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast({
        title: "Error",
        description: "Failed to update featured status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading gallery images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gallery Manager</h1>
        <p className="text-muted-foreground">Manage public gallery images and their visibility</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search gallery images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GALLERY_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Images */}
      <Card>
        <CardHeader>
          <CardTitle>Gallery Images</CardTitle>
          <CardDescription>
            {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredImages.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {images.length === 0 ? 'No gallery images yet' : 'No images match your search'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredImages.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <img
                      src={image.thumbnail_url || image.image_url}
                      alt={image.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=225&fit=crop';
                      }}
                    />
                    <div className="absolute top-2 left-2 flex gap-1">
                      {image.is_featured && (
                        <Badge variant="default" className="text-xs">Featured</Badge>
                      )}
                      {!image.is_visible && (
                        <Badge variant="secondary" className="text-xs">Hidden</Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">{image.title}</h3>
                      {image.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {image.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {image.category}
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyImageUrl(image.image_url)}
                            className="h-7 px-2"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="h-7 px-2"
                          >
                            <a href={image.image_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant={image.is_visible ? "outline" : "default"}
                          onClick={() => toggleVisibility(image.id, image.is_visible)}
                          className="flex-1 text-xs"
                        >
                          {image.is_visible ? 'Hide' : 'Show'}
                        </Button>
                        <Button
                          size="sm"
                          variant={image.is_featured ? "default" : "outline"}
                          onClick={() => toggleFeatured(image.id, image.is_featured)}
                          className="flex-1 text-xs"
                        >
                          {image.is_featured ? 'Unfeature' : 'Feature'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}