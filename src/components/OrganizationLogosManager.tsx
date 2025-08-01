import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Image, Trash2, Eye, Download, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { ImageGalleryPicker } from '@/components/ImageGalleryPicker';

interface Logo {
  id: string;
  name: string;
  file_path: string;
  alt_text?: string;
  is_public: boolean;
  category: string;
  created_at: string;
  file_type: string;
  uploaded_by?: string;
}

export default function OrganizationLogosManager() {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useSupabaseAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadLogos();
  }, []);

  const loadLogos = async () => {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('category', 'company_logo')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogos(data || []);
    } catch (error: any) {
      toast({
        title: "Error Loading Logos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (logoUrl: string, logoName: string) => {
    if (!user || !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to manage logos.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('images')
        .insert({
          name: logoName,
          file_path: logoUrl,
          category: 'company_logo',
          alt_text: `${logoName} logo`,
          uploaded_by: user.id,
          file_type: 'image/png',
          is_public: true
        });

      if (error) throw error;

      toast({
        title: "Logo Added",
        description: "Organization logo added successfully.",
      });

      loadLogos();
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteLogo = async (logoId: string) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to delete logos.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('images')
        .delete()
        .eq('id', logoId);

      if (error) throw error;

      toast({
        title: "Logo Deleted",
        description: "Logo deleted successfully.",
      });
      loadLogos();
    } catch (error: any) {
      toast({
        title: "Delete Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyLogoUrl = (filePath: string) => {
    navigator.clipboard.writeText(filePath);
    toast({
      title: "URL Copied",
      description: "Logo URL copied to clipboard.",
    });
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-muted-foreground">You need admin privileges to manage organization logos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Organization Logos</h2>
          <p className="text-muted-foreground">Manage company and organization logos displayed on the website</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Logo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Add Organization Logo</DialogTitle>
              <DialogDescription>
                Choose a logo from the gallery or upload a new one
              </DialogDescription>
            </DialogHeader>
            
            <ImageGalleryPicker
              onImageSelect={(url) => {
                const logoName = prompt("Enter organization name for this logo:");
                if (logoName) {
                  handleLogoUpload(url, logoName);
                }
              }}
              category="company_logo"
              multiple={false}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Logos Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-muted rounded-t-lg" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {logos.map((logo) => (
            <Card key={logo.id} className="group hover:shadow-lg transition-all duration-300">
              <div className="relative aspect-video overflow-hidden rounded-t-lg bg-white p-4">
                <img
                  src={logo.file_path}
                  alt={logo.alt_text || logo.name}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => copyLogoUrl(logo.file_path)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      asChild
                    >
                      <a href={logo.file_path} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteLogo(logo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm truncate mb-2">{logo.name}</h3>
                <div className="text-xs text-muted-foreground">
                  <span>{new Date(logo.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {logos.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Image className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Logos Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your first organization logo to get started.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Add Logo</Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}