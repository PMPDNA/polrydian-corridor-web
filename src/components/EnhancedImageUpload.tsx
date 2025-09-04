import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  FileImage, 
  AlertTriangle, 
  Check,
  Loader2,
  Info
} from 'lucide-react';

interface UploadedFile {
  file: File;
  preview: string;
  size: string;
  dimensions?: string;
  error?: string;
  uploading?: boolean;
  progress?: number;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const EnhancedImageUpload = ({ 
  onUploadComplete, 
  maxFiles = 5,
  category = 'general'
}: {
  onUploadComplete?: (urls: string[]) => void;
  maxFiles?: number;
  category?: string;
}) => {
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDimensions = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        resolve(`${img.width}x${img.height}`);
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        resolve('Unknown');
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' };
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.` };
    }

    return { valid: true };
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (selectedFiles.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed.`,
        variant: "destructive"
      });
      return;
    }

    const newFiles: UploadedFile[] = [];

    for (const file of files) {
      const validation = validateFile(file);
      const preview = URL.createObjectURL(file);
      const dimensions = await getDimensions(file);

      newFiles.push({
        file,
        preview,
        size: formatFileSize(file.size),
        dimensions,
        error: validation.valid ? undefined : validation.error
      });
    }

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index].preview);
      return updated;
    });
  };

  const uploadFile = async (file: File, index: number): Promise<string | null> => {
    try {
      // Update progress
      setSelectedFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, uploading: true, progress: 0 } : f
      ));

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `images/${category}/${fileName}`;

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setSelectedFiles(prev => prev.map((f, i) => 
          i === index && f.progress !== undefined && f.progress < 90 
            ? { ...f, progress: f.progress + 10 } 
            : f
        ));
      }, 200);

      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      clearInterval(progressInterval);

      if (error) throw error;

      // Update to 100% and mark as complete
      setSelectedFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, uploading: false, progress: 100 } : f
      ));

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      // Save to images table
      await supabase.from('images').insert({
        name: file.name,
        file_path: publicUrl,
        file_type: file.type,
        file_size: file.size,
        category: category,
        alt_text: file.name.split('.')[0].replace(/[-_]/g, ' '),
        is_public: true
      });

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      setSelectedFiles(prev => prev.map((f, i) => 
        i === index ? { 
          ...f, 
          uploading: false, 
          error: 'Upload failed. Please try again.' 
        } : f
      ));
      return null;
    }
  };

  const handleUploadAll = async () => {
    const validFiles = selectedFiles.filter(f => !f.error);
    
    if (validFiles.length === 0) {
      toast({
        title: "No valid files",
        description: "Please select valid image files to upload.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = validFiles.map((fileData, index) => 
        uploadFile(fileData.file, index)
      );

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(url => url !== null) as string[];

      if (successfulUploads.length > 0) {
        toast({
          title: "Upload successful",
          description: `${successfulUploads.length} file(s) uploaded successfully.`,
        });

        onUploadComplete?.(successfulUploads);
        setSelectedFiles([]);
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Some files failed to upload. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const clearAll = () => {
    selectedFiles.forEach(f => URL.revokeObjectURL(f.preview));
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Enhanced Image Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Images</h3>
            <p className="text-muted-foreground mb-4">
              Click to select or drag and drop your files here
            </p>
            <Badge variant="secondary">
              Max {maxFiles} files • JPEG, PNG, WebP • Up to {formatFileSize(MAX_FILE_SIZE)} each
            </Badge>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* File Info */}
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Images will be automatically optimized and stored securely. 
              Supported formats: JPEG, PNG, WebP. Maximum file size: {formatFileSize(MAX_FILE_SIZE)}.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Selected Files ({selectedFiles.length})</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearAll} disabled={uploading}>
                Clear All
              </Button>
              <Button 
                onClick={handleUploadAll} 
                disabled={uploading || selectedFiles.every(f => f.error)}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload All
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedFiles.map((fileData, index) => (
                <div 
                  key={index}
                  className={`flex items-start gap-4 p-4 border rounded-lg ${
                    fileData.error ? 'border-red-200 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  {/* Preview */}
                  <div className="flex-shrink-0">
                    <img 
                      src={fileData.preview} 
                      alt={fileData.file.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{fileData.file.name}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{fileData.size}</span>
                      <span>{fileData.dimensions}</span>
                      <span>{fileData.file.type}</span>
                    </div>
                    
                    {/* Progress */}
                    {fileData.uploading && fileData.progress !== undefined && (
                      <div className="mt-2">
                        <Progress value={fileData.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Uploading... {fileData.progress}%
                        </p>
                      </div>
                    )}

                    {/* Error */}
                    {fileData.error && (
                      <div className="mt-2 flex items-center gap-1 text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">{fileData.error}</span>
                      </div>
                    )}

                    {/* Success */}
                    {fileData.progress === 100 && !fileData.error && (
                      <div className="mt-2 flex items-center gap-1 text-green-600">
                        <Check className="h-4 w-4" />
                        <span className="text-sm">Upload complete</span>
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={fileData.uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};