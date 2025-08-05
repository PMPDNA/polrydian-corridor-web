import { FileUpload } from "@/components/FileUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, Folder } from "lucide-react";

interface StandardizedImageUploadProps {
  title: string;
  description: string;
  onFilesChange: (urls: string[]) => void;
  currentFiles?: string[];
  category: 'logos' | 'articles' | 'avatars' | 'general';
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
}

export function StandardizedImageUpload({
  title,
  description,
  onFilesChange,
  currentFiles = [],
  category,
  multiple = true,
  maxFiles = 10,
  maxSize = 10
}: StandardizedImageUploadProps) {
  const categoryConfig = {
    logos: {
      folder: 'logos',
      accept: 'image/*',
      maxSize: 5,
      description: 'Organization logos and brand assets'
    },
    articles: {
      folder: 'articles',
      accept: 'image/*',
      maxSize: 10,
      description: 'Article images and featured content'
    },
    avatars: {
      folder: 'avatars',
      accept: 'image/*',
      maxSize: 5,
      description: 'User profile pictures and avatars'
    },
    general: {
      folder: 'general',
      accept: 'image/*',
      maxSize: 10,
      description: 'General purpose images'
    }
  };

  const config = categoryConfig[category];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Folder className="h-3 w-3" />
            /images/{config.folder}/
          </Badge>
          <Badge variant="secondary">
            Max {config.maxSize}MB
          </Badge>
          {multiple && (
            <Badge variant="secondary">
              Up to {maxFiles} files
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <FileUpload
          onFilesChange={onFilesChange}
          currentFiles={currentFiles}
          multiple={multiple}
          accept={config.accept}
          maxSize={config.maxSize}
          label={`Upload ${category} images`}
          category={category}
          folder={config.folder}
        />
        
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Storage:</strong> {config.description}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            <strong>Path:</strong> Supabase Storage → images bucket → {config.folder} folder → Database record
          </p>
        </div>
      </CardContent>
    </Card>
  );
}