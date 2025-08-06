import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Upload, Plus, Trash2, ExternalLink, Building2 } from "lucide-react";

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url: string;
  description: string;
  category: string;
  is_visible: boolean;
  display_order: number;
}

export const PartnerLogosUpload = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [uploading, setUploading] = useState(false);
  const [newPartner, setNewPartner] = useState({
    name: '',
    website_url: '',
    description: '',
    category: 'partner'
  });
  const { user, isAdmin } = useSupabaseAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setPartners(data || []);
    } catch (error: any) {
      console.error('Error loading partners:', error);
      toast({
        title: "Error Loading Partners",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !isAdmin) return;

    setUploading(true);

    try {
      // Upload to images bucket
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

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      // Create partner record
      const { error: insertError } = await supabase
        .from('partners')
        .insert({
          name: newPartner.name || 'New Partner',
          logo_url: publicUrl,
          website_url: newPartner.website_url,
          description: newPartner.description,
          category: newPartner.category,
          display_order: partners.length,
          is_visible: true
        });

      if (insertError) throw insertError;

      // Reset form
      setNewPartner({
        name: '',
        website_url: '',
        description: '',
        category: 'partner'
      });

      toast({
        title: "Partner Added",
        description: "Partner logo uploaded and added successfully.",
      });

      loadPartners(); // Reload the list
    } catch (error: any) {
      console.error('Error uploading partner logo:', error);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const updatePartner = async (id: string, updates: Partial<Partner>) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('partners')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Partner Updated",
        description: "Partner information updated successfully.",
      });

      loadPartners();
    } catch (error: any) {
      console.error('Error updating partner:', error);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deletePartner = async (id: string) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Partner Deleted",
        description: "Partner removed successfully.",
      });

      loadPartners();
    } catch (error: any) {
      console.error('Error deleting partner:', error);
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!isAdmin) {
    return (
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-accent" />
            Our Partners
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {partners.filter(p => p.is_visible).map((partner) => (
              <div key={partner.id} className="flex flex-col items-center group">
                <div className="w-20 h-20 mb-3 bg-white rounded-lg shadow-md flex items-center justify-center p-2 group-hover:shadow-lg transition-shadow">
                  <img 
                    src={partner.logo_url} 
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <p className="text-sm font-medium text-center text-foreground">{partner.name}</p>
                {partner.website_url && (
                  <a 
                    href={partner.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-accent hover:underline flex items-center gap-1 mt-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Visit
                  </a>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-6 w-6 text-accent" />
            Add New Partner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="partner-name">Partner Name</Label>
              <Input 
                id="partner-name"
                placeholder="Maven Investment Partners"
                value={newPartner.name}
                onChange={(e) => setNewPartner(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="partner-website">Website URL</Label>
              <Input 
                id="partner-website"
                placeholder="https://maven-partners.com"
                value={newPartner.website_url}
                onChange={(e) => setNewPartner(prev => ({ ...prev, website_url: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="partner-description">Description</Label>
            <Input 
              id="partner-description"
              placeholder="Strategic investment and advisory firm"
              value={newPartner.description}
              onChange={(e) => setNewPartner(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="partner-logo">Partner Logo</Label>
            <Input 
              id="partner-logo"
              type="file" 
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Upload a high-quality logo (PNG, JPG, or SVG recommended)
            </p>
          </div>
          {uploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Upload className="h-4 w-4 animate-pulse" />
              Uploading partner logo...
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-accent" />
            Manage Partners
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {partners.map((partner) => (
              <div key={partner.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                <div className="w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center p-2">
                  <img 
                    src={partner.logo_url} 
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{partner.name}</h4>
                  {partner.description && (
                    <p className="text-sm text-muted-foreground">{partner.description}</p>
                  )}
                  {partner.website_url && (
                    <a 
                      href={partner.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline flex items-center gap-1 mt-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {partner.website_url}
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={partner.is_visible ? "default" : "outline"}
                    onClick={() => updatePartner(partner.id, { is_visible: !partner.is_visible })}
                  >
                    {partner.is_visible ? "Visible" : "Hidden"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deletePartner(partner.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};