import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageGalleryPicker } from "@/components/ImageGalleryPicker";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image as ImageIcon } from "lucide-react";

interface PartnerLogoSelectorProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingPartner?: {
    id: string;
    name: string;
    logo_url: string;
    website_url?: string;
    description?: string;
    category: string;
    display_order: number;
  } | null;
}

export function PartnerLogoSelector({ 
  open, 
  onClose, 
  onSuccess, 
  editingPartner 
}: PartnerLogoSelectorProps) {
  const [formData, setFormData] = useState({
    name: editingPartner?.name || '',
    website_url: editingPartner?.website_url || '',
    description: editingPartner?.description || '',
    category: editingPartner?.category || 'partner',
    logo_url: editingPartner?.logo_url || '',
    display_order: editingPartner?.display_order || 0
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleImageSelect = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, logo_url: imageUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.logo_url) {
      toast({
        title: "Required Fields",
        description: "Please provide both partner name and logo.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      if (editingPartner) {
        // Update existing partner
        const { error } = await supabase
          .from('partners')
          .update({
            name: formData.name,
            logo_url: formData.logo_url,
            website_url: formData.website_url || null,
            description: formData.description || null,
            category: formData.category,
            display_order: formData.display_order,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPartner.id);

        if (error) throw error;

        toast({
          title: "Partner Updated",
          description: "Partner information has been updated successfully."
        });
      } else {
        // Create new partner
        const { error } = await supabase
          .from('partners')
          .insert({
            name: formData.name,
            logo_url: formData.logo_url,
            website_url: formData.website_url || null,
            description: formData.description || null,
            category: formData.category,
            display_order: formData.display_order,
            is_visible: true
          });

        if (error) throw error;

        toast({
          title: "Partner Added",
          description: "New partner has been added successfully."
        });
      }

      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        website_url: '',
        description: '',
        category: 'partner',
        logo_url: '',
        display_order: 0
      });
    } catch (error: any) {
      console.error('Error saving partner:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save partner information.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (editingPartner) {
      setFormData({
        name: editingPartner.name,
        website_url: editingPartner.website_url || '',
        description: editingPartner.description || '',
        category: editingPartner.category,
        logo_url: editingPartner.logo_url,
        display_order: editingPartner.display_order
      });
    } else {
      setFormData({
        name: '',
        website_url: '',
        description: '',
        category: 'partner',
        logo_url: '',
        display_order: 0
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingPartner ? 'Edit Partner' : 'Add New Partner'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Form Fields */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Partner Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Partner Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Maven Investment Partners"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="website_url">Website URL</Label>
                    <Input
                      id="website_url"
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="institutional">Institutional</SelectItem>
                        <SelectItem value="partner">Partner</SelectItem>
                        <SelectItem value="investment">Investment</SelectItem>
                        <SelectItem value="real_estate">Real Estate</SelectItem>
                        <SelectItem value="fellowship">Fellowship</SelectItem>
                        <SelectItem value="think_tank">Think Tank</SelectItem>
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the partnership..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Logo Selection */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Logo Selection *
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Current Logo Preview */}
                  {formData.logo_url && (
                    <div className="mb-4 p-4 border rounded-lg bg-muted/30">
                      <div className="text-sm font-medium mb-2">Selected Logo:</div>
                      <div className="flex items-center justify-center bg-white rounded p-4 border">
                        <img 
                          src={formData.logo_url} 
                          alt="Selected logo"
                          className="max-h-20 max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-2 break-all">
                        {formData.logo_url}
                      </div>
                    </div>
                  )}

                  {/* Image Gallery Picker */}
                  <ImageGalleryPicker
                    onImageSelect={handleImageSelect}
                    selectedImage={formData.logo_url}
                    category="all"
                    multiple={false}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={resetForm}
            >
              Reset Form
            </Button>
            
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !formData.name || !formData.logo_url}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {editingPartner ? 'Update Partner' : 'Add Partner'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}