import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { PartnerLogoSelector } from '@/components/PartnerLogoSelector';
import { 
  Upload, 
  ExternalLink, 
  Copy, 
  Trash2, 
  Eye,
  Plus,
  Building2,
  Edit
} from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string;
  description?: string;
  category: string;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export function EnhancedPartnerLogosManager() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSelector, setShowSelector] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const { isAdmin } = useSupabaseAuth();
  const { toast } = useToast();

  const loadPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      setPartners(data || []);
    } catch (error: any) {
      console.error('Error loading partners:', error);
      toast({
        title: "Error Loading Partners",
        description: error.message || "Failed to load partner information.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePartner = async (partnerId: string) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to delete partners.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', partnerId);

      if (error) throw error;

      toast({
        title: "Partner Deleted",
        description: "Partner has been successfully deleted.",
      });

      await loadPartners();
    } catch (error: any) {
      console.error('Error deleting partner:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete partner.",
        variant: "destructive"
      });
    }
  };

  const copyLogoUrl = async (logoUrl: string) => {
    try {
      await navigator.clipboard.writeText(logoUrl);
      toast({
        title: "URL Copied",
        description: "Logo URL has been copied to clipboard.",
      });
    } catch (error) {
      console.error('Error copying URL:', error);
      toast({
        title: "Error",
        description: "Failed to copy URL to clipboard.",
        variant: "destructive"
      });
    }
  };

  const toggleVisibility = async (partnerId: string, isVisible: boolean) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to modify partners.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('partners')
        .update({ is_visible: !isVisible })
        .eq('id', partnerId);

      if (error) throw error;

      toast({
        title: "Partner Updated",
        description: `Partner ${!isVisible ? 'shown' : 'hidden'} successfully.`,
      });

      await loadPartners();
    } catch (error: any) {
      console.error('Error updating partner:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update partner.",
        variant: "destructive"
      });
    }
  };

  const handleEditPartner = (partner: Partner) => {
    setEditingPartner(partner);
    setShowSelector(true);
  };

  const handleSelectorClose = () => {
    setShowSelector(false);
    setEditingPartner(null);
  };

  const handleSelectorSuccess = () => {
    loadPartners();
  };

  useEffect(() => {
    loadPartners();
  }, []);

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground">
            You need admin privileges to manage partner logos.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <LoadingSpinner />
          <p className="text-muted-foreground mt-4">Loading partners...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Partner Logos Management</h2>
          <p className="text-muted-foreground">
            Manage partner organizations, logos, and display settings
          </p>
        </div>
        <Button 
          onClick={() => setShowSelector(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Partner
        </Button>
      </div>

      {/* Current Partner Logos */}
      {partners.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner) => (
            <Card key={partner.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      {partner.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={partner.is_visible ? "default" : "secondary"}>
                        {partner.is_visible ? "Visible" : "Hidden"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {partner.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Logo Display */}
                  <div 
                    className="bg-muted/30 rounded-lg p-4 flex items-center justify-center min-h-[120px] cursor-pointer hover:bg-muted/50 transition-colors border-2 border-dashed border-muted-foreground/20 hover:border-primary/30"
                    onClick={() => handleEditPartner(partner)}
                    title="Click to edit logo"
                  >
                    {partner.logo_url ? (
                      <img 
                        src={partner.logo_url} 
                        alt={partner.name}
                        className="max-h-20 max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-muted-foreground text-sm flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8" />
                        <span>Click to upload logo</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {partner.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {partner.description}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditPartner(partner)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyLogoUrl(partner.logo_url)}
                      className="flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copy URL
                    </Button>
                    
                    {partner.website_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="flex items-center gap-1"
                      >
                        <a href={partner.website_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                          Visit
                        </a>
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleVisibility(partner.id, partner.is_visible)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      {partner.is_visible ? 'Hide' : 'Show'}
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deletePartner(partner.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>

                  {/* Metadata */}
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Order: {partner.display_order}</span>
                      <span>Added: {new Date(partner.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Partners Added</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first partner organization and their logo.
            </p>
            <Button 
              onClick={() => setShowSelector(true)}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              Add First Partner
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Expected Partners */}
      <Card>
        <CardHeader>
          <CardTitle>Expected Partner Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Maven Investment Partners', category: 'Investment' },
              { name: 'KCC Capital', category: 'Investment' },
              { name: 'Lee & Associates', category: 'Real Estate' },
              { name: 'GMF Marshall Memorial Fellowship', category: 'Fellowship' },
              { name: 'World Affairs Council of Miami', category: 'Think Tank' }
            ].map((expectedPartner, index) => {
              const exists = partners.find(p => 
                p.name.toLowerCase().includes(expectedPartner.name.toLowerCase()) ||
                expectedPartner.name.toLowerCase().includes(p.name.toLowerCase())
              );
              
              return (
                <div key={index} className={`p-3 rounded-lg border ${exists ? 'bg-green-50 border-green-200' : 'bg-muted/30 border-border'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{expectedPartner.name}</div>
                      <div className="text-xs text-muted-foreground">{expectedPartner.category}</div>
                    </div>
                    {exists ? (
                      <Badge variant="default" className="text-xs">Added</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Pending</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Partner Logo Selector Modal */}
      <PartnerLogoSelector
        open={showSelector}
        onClose={handleSelectorClose}
        onSuccess={handleSelectorSuccess}
        editingPartner={editingPartner}
      />
    </div>
  );
}