import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Trash2, Camera, User, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const AdminProfileManager = () => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentProfileUrl, setCurrentProfileUrl] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [storageFiles, setStorageFiles] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentProfile();
    loadStorageFiles();
  }, []);

  const loadCurrentProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.avatar_url) {
          setCurrentProfileUrl(profile.avatar_url);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadStorageFiles = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .list('', { limit: 100 });

      if (error) throw error;
      setStorageFiles(data || []);
    } catch (error) {
      console.error('Error loading storage files:', error);
    }
  };

  const deleteCurrentProfileImage = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "Must be logged in to delete profile image",
        variant: "destructive"
      });
      return;
    }

    setDeleting(true);
    try {
      // Delete all profile-related files from storage
      const filesToDelete = storageFiles
        .filter(file => file.name.includes('patrick-profile'))
        .map(file => file.name);

      if (filesToDelete.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove(filesToDelete);

        if (deleteError) throw deleteError;

        toast({
          title: "Success",
          description: `Deleted ${filesToDelete.length} profile image(s) permanently`,
        });
      }

      // Clear avatar_url from profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', currentUser.id);

      if (updateError) throw updateError;

      setCurrentProfileUrl('');
      await loadStorageFiles();

    } catch (error: any) {
      console.error('Error deleting profile image:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete profile image",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  const uploadNewProfileImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "Must be logged in to upload profile image",
        variant: "destructive"
      });
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "Error", 
        description: "Image must be smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      // Create new filename with timestamp for uniqueness
      const fileExt = file.name.split('.').pop();
      const fileName = `patrick-profile-${Date.now()}.${fileExt}`;

      // Upload new image
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false // Don't overwrite, create new
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          user_id: currentUser.id,
          avatar_url: data.publicUrl,
          display_name: 'Patrick Misiewicz'
        }, {
          onConflict: 'user_id'
        });

      if (updateError) throw updateError;

      setCurrentProfileUrl(data.publicUrl);
      await loadStorageFiles();

      toast({
        title: "Success",
        description: "New profile image uploaded successfully!",
      });

      // Clear the input
      event.target.value = '';

    } catch (error: any) {
      console.error('Error uploading profile image:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload profile image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Admin Profile Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Profile Display */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative w-48 h-48 rounded-full overflow-hidden shadow-lg">
              {currentProfileUrl ? (
                <img 
                  src={currentProfileUrl} 
                  alt="Current Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <User className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
          
          {currentProfileUrl && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Current profile image URL: {currentProfileUrl}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Storage Files Overview */}
        <div className="space-y-2">
          <Label>Files in Avatar Storage:</Label>
          <div className="text-sm text-muted-foreground">
            {storageFiles.length > 0 ? (
              <ul className="list-disc pl-4">
                {storageFiles.map((file, index) => (
                  <li key={index}>{file.name} ({Math.round(file.metadata?.size / 1024)}KB)</li>
                ))}
              </ul>
            ) : (
              <p>No files found in storage</p>
            )}
          </div>
        </div>

        {/* Delete Current Image */}
        {currentProfileUrl && (
          <div className="space-y-2">
            <Button 
              variant="destructive" 
              onClick={deleteCurrentProfileImage}
              disabled={deleting}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? 'Deleting...' : 'Delete Current Profile Image Permanently'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              This will permanently delete the image and clear your profile
            </p>
          </div>
        )}

        {/* Upload New Image */}
        <div className="space-y-2">
          <Label htmlFor="new-profile-upload">Upload New Profile Image</Label>
          <Input
            id="new-profile-upload"
            type="file"
            accept="image/*"
            onChange={uploadNewProfileImage}
            disabled={uploading}
            className="cursor-pointer"
          />
        </div>
        
        <Button 
          disabled={uploading}
          className="w-full"
          onClick={() => document.getElementById('new-profile-upload')?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Choose New Profile Image'}
        </Button>
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Recommended: Square image, minimum 512x512 pixels, max 5MB. 
            New image will replace the current one everywhere on the site.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};