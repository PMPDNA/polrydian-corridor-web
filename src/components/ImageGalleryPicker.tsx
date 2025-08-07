import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Search, 
  Image as ImageIcon, 
  Upload,
  Check,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/FileUpload";

interface Image {
  id: string;
  name: string;
  file_path: string;
  category: string;
  alt_text?: string;
  created_at: string;
}

interface ImageGalleryPickerProps {
  onImageSelect: (imageUrl: string) => void;
  selectedImage?: string;
  category?: string;
  multiple?: boolean;
  maxImages?: number;
}

export function ImageGalleryPicker({ 
  onImageSelect, 
  selectedImage, 
  category = 'all',
  multiple = false,
  maxImages = 5
}: ImageGalleryPickerProps) {
  const [images, setImages] = useState<Image[]>([]);
  const [filteredImages, setFilteredImages] = useState<Image[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState(category);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState<string[]>(
    selectedImage ? [selectedImage] : []
  );
  const [showUpload, setShowUpload] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    filterImages();
  }, [images, searchTerm, filterCategory]);

  const loadImages = async () => {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setImages(data || []);
    } catch (error: any) {
      console.error('Error loading images:', error);
      toast({
        title: "Error",
        description: "Failed to load images.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterImages = () => {
    let filtered = images;

    if (filterCategory !== 'all') {
      filtered = filtered.filter(img => img.category === filterCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(img => 
        img.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.alt_text?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredImages(filtered);
  };

  const handleImageClick = (imageUrl: string) => {
    if (multiple) {
      setSelectedImages(prev => {
        if (prev.includes(imageUrl)) {
          return prev.filter(url => url !== imageUrl);
        } else if (prev.length < maxImages) {
          return [...prev, imageUrl];
        } else {
          toast({
            title: "Maximum Images Reached",
            description: `You can select up to ${maxImages} images.`,
            variant: "destructive",
          });
          return prev;
        }
      });
    } else {
      setSelectedImages([imageUrl]);
      onImageSelect(imageUrl);
    }
  };

  const handleConfirmSelection = () => {
    if (multiple) {
      selectedImages.forEach(imageUrl => onImageSelect(imageUrl));
    }
  };

  const handleUploadComplete = (urls: string[]) => {
    setShowUpload(false);
    loadImages(); // Reload to show new images
    toast({
      title: "Upload Complete",
      description: `${urls.length} image(s) uploaded successfully.`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="hero">Hero Images</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="gallery">Gallery</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={showUpload} onOpenChange={setShowUpload}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Images</DialogTitle>
            </DialogHeader>
            <FileUpload
              onFilesChange={handleUploadComplete}
              multiple={true}
              label="Upload Images"
              className="min-h-32"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Selection Info */}
      {multiple && selectedImages.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="text-sm">
            {selectedImages.length} of {maxImages} images selected
          </span>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setSelectedImages([])}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
            <Button size="sm" onClick={handleConfirmSelection}>
              <Check className="h-4 w-4 mr-1" />
              Confirm
            </Button>
          </div>
        </div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
        {filteredImages.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No images found.</p>
            <p className="text-sm">Try adjusting your search or upload new images.</p>
          </div>
        ) : (
          filteredImages.map((image) => (
            <Card 
              key={image.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedImages.includes(image.file_path) 
                  ? 'ring-2 ring-primary' 
                  : 'hover:ring-1 hover:ring-border'
              }`}
              onClick={() => handleImageClick(image.file_path)}
            >
              <CardContent className="p-2">
                <div className="aspect-square relative mb-2">
                  <img
                    src={image.file_path}
                    alt={image.alt_text || image.name}
                    className="w-full h-full object-cover rounded"
                    loading="lazy"
                  />
                  {selectedImages.includes(image.file_path) && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium line-clamp-1" title={image.name}>
                    {image.name}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {image.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}