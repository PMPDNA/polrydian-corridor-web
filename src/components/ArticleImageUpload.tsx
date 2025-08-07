import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, ImageIcon, X } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { ImageGalleryPicker } from '@/components/ImageGalleryPicker';

interface ArticleImageUploadProps {
  onImageInsert: (imageUrl: string) => void;
  className?: string;
}

export const ArticleImageUpload = ({ onImageInsert, className = '' }: ArticleImageUploadProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleImageSelect = (url: string) => {
    onImageInsert(url);
    setIsDialogOpen(false);
  };

  const handleFilesChange = (urls: string[]) => {
    setUploadedImages(urls);
    if (urls.length > 0) {
      onImageInsert(urls[urls.length - 1]); // Insert the latest uploaded image
      setIsDialogOpen(false);
    }
  };

  return (
    <div className={`border border-dashed border-border rounded-lg p-4 bg-muted/30 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">Add Images to Article</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDialogOpen(false)}
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mb-3">
        Upload new images or choose from your gallery to include in your article content
      </p>
      
      <div className="flex gap-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <ImageIcon className="h-4 w-4 mr-2" />
              Choose from Gallery
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Choose Image for Article</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <ImageGalleryPicker
                onImageSelect={handleImageSelect}
                selectedImage=""
                category="content"
                multiple={false}
              />
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Or Upload New Image</h4>
                <FileUpload
                  onFilesChange={handleFilesChange}
                  currentFiles={uploadedImages}
                  multiple={false}
                  label="Upload New Image"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsDialogOpen(true)}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload New
        </Button>
      </div>
      
      {uploadedImages.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {uploadedImages.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Uploaded ${index + 1}`}
              className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80"
              onClick={() => handleImageSelect(url)}
            />
          ))}
        </div>
      )}
    </div>
  );
};