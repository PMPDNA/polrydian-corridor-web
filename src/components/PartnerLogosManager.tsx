import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, Trash2, ExternalLink, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string;
  description?: string;
  category: string;
  is_visible: boolean;
  display_order: number;
}

export const PartnerLogosManager = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newPartner, setNewPartner] = useState({
    name: '',
    website_url: '',
    description: '',
    category: 'partner'
  });
  const { toast } = useToast();
  const { user, isAdmin } = useSupabaseAuth();

  useEffect(() => {
    if (isAdmin) {
      fetchPartners();
    }
  }, [isAdmin]);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPartners(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch partners",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `partner-${Date.now()}.${fileExt}`;
      const filePath = `partners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      // Create partner entry
      const { data, error } = await supabase
        .from('partners')
        .insert([{
          name: newPartner.name || `Partner ${partners.length + 1}`,
          logo_url: publicUrl,
          website_url: newPartner.website_url,
          description: newPartner.description,
          category: newPartner.category,
          display_order: partners.length,
          is_visible: true
        }])
        .select()
        .single();

      if (error) throw error;

      setPartners([...partners, data]);
      setNewPartner({ name: '', website_url: '', description: '', category: 'partner' });
      
      toast({
        title: "Partner Added",
        description: "Partner logo uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const toggleVisibility = async (partnerId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('partners')
        .update({ is_visible: !currentVisibility })
        .eq('id', partnerId);

      if (error) throw error;

      setPartners(partners.map(p => 
        p.id === partnerId ? { ...p, is_visible: !currentVisibility } : p
      ));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update partner visibility",
        variant: "destructive",
      });
    }
  };

  const deletePartner = async (partnerId: string) => {
    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', partnerId);

      if (error) throw error;

      setPartners(partners.filter(p => p.id !== partnerId));
      
      toast({
        title: "Partner Deleted",
        description: "Partner removed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete partner",
        variant: "destructive",
      });
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            Admin access required to manage partner logos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Partner Logos Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Partner */}
          <div className="border border-dashed border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Add New Partner</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="partner-name">Partner Name</Label>
                <Input
                  id="partner-name"
                  value={newPartner.name}
                  onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                  placeholder="Partner Organization Name"
                />
              </div>
              <div>
                <Label htmlFor="partner-website">Website URL</Label>
                <Input
                  id="partner-website"
                  value={newPartner.website_url}
                  onChange={(e) => setNewPartner({ ...newPartner, website_url: e.target.value })}
                  placeholder="https://partner-website.com"
                />
              </div>
            </div>
            <div className="mb-4">
              <Label htmlFor="partner-description">Description (Optional)</Label>
              <Input
                id="partner-description"
                value={newPartner.description}
                onChange={(e) => setNewPartner({ ...newPartner, description: e.target.value })}
                placeholder="Brief description of partnership"
              />
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  <Plus className="h-4 w-4" />
                  {uploading ? "Uploading..." : "Upload Logo"}
                </div>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </Label>
            </div>
          </div>

          {/* Existing Partners */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading partners...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {partners.map((partner) => (
                <Card key={partner.id} className="relative">
                  <CardContent className="p-4">
                    <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
                      <img 
                        src={partner.logo_url} 
                        alt={partner.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{partner.name}</h4>
                        <Badge variant={partner.is_visible ? "default" : "secondary"}>
                          {partner.is_visible ? "Visible" : "Hidden"}
                        </Badge>
                      </div>
                      {partner.website_url && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full text-xs"
                          asChild
                        >
                          <a href={partner.website_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Visit Website
                          </a>
                        </Button>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => toggleVisibility(partner.id, partner.is_visible)}
                        >
                          {partner.is_visible ? "Hide" : "Show"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deletePartner(partner.id)}
                        >
                          <Trash2 className="h-3 w-3" />
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
};
