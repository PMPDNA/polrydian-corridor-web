import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Image as ImageIcon, FileImage, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UploadedFile {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
  type: string;
}

interface FileUploadProps {
  onFilesChange: (urls: string[]) => void;
  currentFiles?: string[];
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  label?: string;
  category?: 'logos' | 'articles' | 'avatars' | 'general';
  folder?: string;
}

export function FileUpload({
  onFilesChange,
  currentFiles = [],
  multiple = true,
  accept = "image/*",
  maxSize = 10,
  className = "",
  label = "Upload Images",
  category = 'general',
  folder
}: FileUploadProps) {
  const { toast } = useToast();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    setIsUploading(true);
    const newFiles: UploadedFile[] = [];
    const uploadedUrls: string[] = [];
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive"
        });
        continue;
      }

      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than ${maxSize}MB`,
          variant: "destructive"
        });
        continue;
      }

      try {
        // Upload to Supabase Storage with organized folder structure
        const folderPath = folder || category;
        const fileName = `${folderPath}/${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from('images')
          .upload(fileName, file);

        if (error) {
          console.error('Upload error:', error);
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}`,
            variant: "destructive"
          });
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(fileName);

        const uploadedFile: UploadedFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          file,
          url: publicUrl,
          name: file.name,
          size: file.size,
          type: file.type
        };

        newFiles.push(uploadedFile);
        uploadedUrls.push(publicUrl);

        // Store in database with proper categorization
        await supabase
          .from('images')
          .insert({
            file_path: publicUrl,
            name: file.name,
            file_type: file.type,
            file_size: file.size,
            category: category,
            is_public: true,
            uploaded_by: (await supabase.auth.getUser()).data.user?.id
          });

      } catch (error) {
        console.error('Error processing file:', error);
        toast({
          title: "Processing error",
          description: `Error processing ${file.name}`,
          variant: "destructive"
        });
      }
    }

    if (newFiles.length > 0) {
      const updatedFiles = multiple ? [...uploadedFiles, ...newFiles] : newFiles;
      setUploadedFiles(updatedFiles);
      
      // Pass uploaded URLs to parent
      const allUrls = multiple ? [...currentFiles, ...uploadedUrls] : uploadedUrls;
      onFilesChange(allUrls);

      toast({
        title: "Files uploaded successfully",
        description: `${newFiles.length} image(s) uploaded to storage`,
      });
    }

    setIsUploading(false);
  }, [uploadedFiles, currentFiles, multiple, maxSize, onFilesChange, toast]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  const removeFile = useCallback((fileId: string) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(updatedFiles);
    
    // Clean up URL
    const fileToRemove = uploadedFiles.find(f => f.id === fileId);
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.url);
    }

    // Update parent with remaining URLs
    const remainingUrls = [...currentFiles.filter(url => 
      !uploadedFiles.find(f => f.url === url && f.id === fileId)
    ), ...updatedFiles.map(f => f.url)];
    onFilesChange(remainingUrls);
  }, [uploadedFiles, currentFiles, onFilesChange]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      {/* Drop Zone */}
      <Card
        className={`relative border-2 border-dashed transition-all duration-300 cursor-pointer ${
          isDragOver 
            ? "border-primary bg-primary/5 scale-105" 
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className={`p-4 rounded-full mb-4 transition-colors ${
            isDragOver ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}>
            <Upload className="h-8 w-8" />
          </div>
          
          <h3 className="text-lg font-semibold mb-2">{label}</h3>
          <p className="text-muted-foreground mb-4">
            {isDragOver 
              ? "Drop your images here..." 
              : "Drag & drop images here, or click to browse"
            }
          </p>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="outline">JPG, PNG, GIF</Badge>
            <Badge variant="outline">Max {maxSize}MB</Badge>
            {multiple && <Badge variant="outline">Multiple files</Badge>}
          </div>

          {isUploading && (
            <div className="mt-4">
              <div className="animate-pulse text-sm text-muted-foreground">
                Processing images...
              </div>
            </div>
          )}
        </CardContent>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
        />
      </Card>

      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Uploaded Images ({uploadedFiles.length})
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedFiles.map((file) => (
              <Card key={file.id} className="group relative overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300" />
                  
                  {/* Remove Button */}
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <FileImage className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Current Files (from URLs) */}
      {currentFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Current Images ({currentFiles.length})
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentFiles.map((url, index) => (
              <Card key={index} className="group relative overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={url}
                    alt={`Current image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300" />
                  
                  {/* Remove Button */}
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      const updatedUrls = currentFiles.filter((_, i) => i !== index);
                      onFilesChange(updatedUrls);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <FileImage className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground truncate">
                        External Image
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}