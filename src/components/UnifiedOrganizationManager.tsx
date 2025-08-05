import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/FileUpload";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { 
  Plus, Pencil, ExternalLink, Trash2, Building, Briefcase, 
  Copy, Eye, Upload, Save, X 
} from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

interface Organization {
  id: string;
  name: string;
  logo_url?: string;
  website_url?: string;
  category: 'institutional' | 'business';
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export const UnifiedOrganizationManager = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newOrg, setNewOrg] = useState<Partial<Organization>>({
    category: 'business'
  });
  const { toast } = useToast();
  const { isAdmin } = useSupabaseAuth();

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('category', 'company_logo')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert image records to organization format
      const orgs: Organization[] = (data || []).map(img => ({
        id: img.id,
        name: img.name || 'Unknown Organization',
        logo_url: img.file_path,
        website_url: img.description || '', // Store website URL in description
        category: img.alt_text?.includes('institutional') ? 'institutional' : 'business',
        description: img.tags?.join(', ') || '',
        created_at: img.created_at,
        updated_at: img.updated_at
      }));

      // Add default organizations if none exist
      if (orgs.length === 0) {
        setOrganizations(getDefaultOrganizations());
      } else {
        setOrganizations(orgs);
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
      setOrganizations(getDefaultOrganizations());
      toast({
        title: "Error loading organizations",
        description: "Using default organization list",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getDefaultOrganizations = (): Organization[] => [
    // Institutional Partners
    { id: "1", name: "World Affairs Council of Miami", website_url: "https://worldaffairs.miami", category: 'institutional' },
    { id: "2", name: "World Affairs Council of Americas", website_url: "https://worldaffairscouncils.org", category: 'institutional' },
    { id: "3", name: "GMF Marshall Memorial Fellowship", website_url: "https://www.gmfus.org/marshall-memorial-fellowship", category: 'institutional' },
    { id: "4", name: "SIPA FIU", website_url: "https://sipa.fiu.edu", category: 'institutional' },
    { id: "5", name: "Concordia", website_url: "https://www.concordia.net", category: 'institutional' },
    { id: "6", name: "FII Institute", website_url: "https://fii-institute.org", category: 'institutional' },
    { id: "7", name: "NATO", website_url: "https://www.nato.int", category: 'institutional' },
    { id: "8", name: "MDC Honors College", website_url: "https://www.mdc.edu/honorscollege/", category: 'institutional' },
    
    // Business Partners
    { 
      id: "16", 
      name: "Maven Investment Partners", 
      website_url: "https://mavenip.net", 
      category: 'business',
      description: "Maven Investment Partners is a Middle East based boutique advisory firm comprising of senior industry veterans with extensive experience in Corporate Finance Advisory, M&A Advisory, Transformation & Restructuring Advisory, Interim & Crisis Management and Corporate Governance Initiatives."
    },
    { 
      id: "17", 
      name: "KCC Capital", 
      website_url: "https://kcccapitalpartners.com", 
      category: 'business',
      description: "We provide investment banking, capital formation, and advisory services for companies, funds, and family offices. Our core focuses are capital raising and sell-side M&A as well as IPO advisory."
    },
    {
      id: "18",
      name: "Lee & Associates",
      website_url: "https://www.lee-associates.com/southflorida/our-team/sebastian-misiewicz/",
      category: 'business',
      description: "Commercial real estate specializing in warehouses, schools, and international hotels. Working with Sebastian Misiewicz, Principal. Representing both buyers and sellers with deal mandates ranging from $20M to $500M."
    }
  ];

  const handleLogoUpload = async (urls: string[], orgId: string) => {
    if (urls.length > 0 && isAdmin) {
      try {
        // Update in database
        const org = organizations.find(o => o.id === orgId);
        if (org) {
          const { error } = await supabase
            .from('images')
            .upsert({
              id: orgId,
              file_path: urls[0],
              name: org.name,
              category: 'company_logo',
              alt_text: `${org.category} partner logo`,
              description: org.website_url,
              tags: [org.category, 'partner', 'logo'],
              is_public: true,
              file_type: 'image/jpeg'
            });

          if (error) throw error;
        }

        // Update local state
        const updatedOrgs = organizations.map(org => 
          org.id === orgId ? { ...org, logo_url: urls[0] } : org
        );
        setOrganizations(updatedOrgs);
        
        toast({
          title: "Logo uploaded successfully",
          description: "The organization logo has been updated.",
        });
      } catch (error) {
        console.error('Error uploading logo:', error);
        toast({
          title: "Upload failed",
          description: "Failed to upload logo to database.",
          variant: "destructive"
        });
      }
    } else if (!isAdmin) {
      toast({
        title: "Access denied",
        description: "You need admin privileges to upload logos.",
        variant: "destructive"
      });
    }
  };

  const handleWebsiteUpdate = async (orgId: string, websiteUrl: string) => {
    if (!isAdmin) {
      toast({
        title: "Access denied",
        description: "You need admin privileges to edit organizations.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Update in database
      const { error } = await supabase
        .from('images')
        .update({ description: websiteUrl })
        .eq('id', orgId);

      if (error) throw error;

      // Update local state
      const updatedOrgs = organizations.map(org => 
        org.id === orgId ? { ...org, website_url: websiteUrl } : org
      );
      setOrganizations(updatedOrgs);
      setEditingOrg(null);
      
      toast({
        title: "Website updated",
        description: "The organization website has been updated.",
      });
    } catch (error) {
      console.error('Error updating website:', error);
      toast({
        title: "Update failed",
        description: "Failed to update website URL.",
        variant: "destructive"
      });
    }
  };

  const handleOrgClick = (org: Organization) => {
    if (org.website_url && !isEditing) {
      window.open(org.website_url, '_blank');
    }
  };

  const deleteOrganization = async (orgId: string) => {
    if (!isAdmin) {
      toast({
        title: "Access denied",
        description: "You need admin privileges to delete organizations.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('images')
        .delete()
        .eq('id', orgId);

      if (error) throw error;

      setOrganizations(organizations.filter(org => org.id !== orgId));
      toast({
        title: "Organization removed",
        description: "The organization has been removed from the database.",
      });
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete organization from database.",
        variant: "destructive"
      });
    }
  };

  const addNewOrganization = async () => {
    if (!isAdmin || !newOrg.name) {
      toast({
        title: "Invalid data",
        description: "Organization name is required.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('images')
        .insert({
          name: newOrg.name,
          category: 'company_logo',
          alt_text: `${newOrg.category} partner logo`,
          description: newOrg.website_url,
          tags: [newOrg.category || 'business', 'partner', 'logo'],
          is_public: true,
          file_type: 'image/jpeg',
          file_path: newOrg.logo_url || ''
        })
        .select()
        .single();

      if (error) throw error;

      const organization: Organization = {
        id: data.id,
        name: data.name,
        logo_url: data.file_path,
        website_url: data.description,
        category: newOrg.category as 'institutional' | 'business',
        description: newOrg.description,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setOrganizations([...organizations, organization]);
      setNewOrg({ category: 'business' });
      setShowAddDialog(false);
      
      toast({
        title: "Organization added",
        description: "New organization has been added successfully.",
      });
    } catch (error) {
      console.error('Error adding organization:', error);
      toast({
        title: "Add failed",
        description: "Failed to add organization to database.",
        variant: "destructive"
      });
    }
  };

  const copyLogoUrl = (logoUrl: string | undefined) => {
    if (logoUrl) {
      navigator.clipboard.writeText(logoUrl);
      toast({
        title: "URL copied",
        description: "Logo URL has been copied to clipboard.",
      });
    }
  };

  const institutionalOrgs = organizations.filter(org => org.category === 'institutional');
  const businessOrgs = organizations.filter(org => org.category === 'business');

  const renderOrganizationCard = (org: Organization, showControls: boolean = false) => {
    const CardComponent = (
      <Card 
        key={org.id}
        className={`relative p-4 flex flex-col items-center justify-center min-h-[150px] transition-all duration-300 bg-background/50 ${
          org.website_url && !isEditing ? 'hover:shadow-lg cursor-pointer hover:bg-background/70' : ''
        }`}
        onClick={() => !isEditing && handleOrgClick(org)}
      >
        {showControls && isAdmin && (
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                copyLogoUrl(org.logo_url);
              }}
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setEditingOrg(org);
              }}
            >
              <Pencil className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                deleteOrganization(org.id);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
        
        <div className="text-center w-full">
          {org.logo_url ? (
            <div className="mb-3">
              <img 
                src={org.logo_url} 
                alt={`${org.name} logo`}
                className="w-16 h-16 object-contain mx-auto rounded"
              />
            </div>
          ) : showControls && isAdmin ? (
            <div className="mb-3 w-full">
              <FileUpload
                onFilesChange={(urls) => handleLogoUpload(urls, org.id)}
                multiple={false}
                accept="image/*"
                label="Upload Logo"
                className="text-xs"
                category="logos"
                folder="logos"
              />
            </div>
          ) : (
            <div className="mb-3 w-16 h-16 mx-auto bg-muted rounded flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Logo</span>
            </div>
          )}
          
          <div className="text-xs font-medium text-foreground/80 leading-tight mb-2">
            {org.name}
          </div>
          
          {org.website_url && !isEditing && (
            <ExternalLink className="w-3 h-3 text-muted-foreground mx-auto" />
          )}
          
          {editingOrg?.id === org.id && (
            <div className="mt-2 space-y-2 w-full">
              <Label htmlFor={`website-${org.id}`} className="text-xs">Website URL</Label>
              <Input
                id={`website-${org.id}`}
                type="url"
                defaultValue={org.website_url}
                placeholder="https://example.com"
                className="text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleWebsiteUpdate(org.id, e.currentTarget.value);
                  }
                }}
              />
              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={() => {
                    const input = document.getElementById(`website-${org.id}`) as HTMLInputElement;
                    handleWebsiteUpdate(org.id, input.value);
                  }}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingOrg(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    );

    // Wrap business cards with tooltips for description
    if (org.description && org.category === 'business') {
      return (
        <TooltipProvider key={org.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              {CardComponent}
            </TooltipTrigger>
            <TooltipContent className="max-w-xs p-3">
              <div className="text-sm">{org.description}</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return CardComponent;
  };

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="animate-pulse">Loading organizations...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Strategic Partnerships & Affiliations
            </h2>
            {isAdmin && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  {isEditing ? 'Done Editing' : 'Edit Mode'}
                </Button>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Organization
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Organization</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="org-name">Organization Name *</Label>
                        <Input
                          id="org-name"
                          value={newOrg.name || ''}
                          onChange={(e) => setNewOrg({...newOrg, name: e.target.value})}
                          placeholder="Enter organization name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="org-category">Category</Label>
                        <Select 
                          value={newOrg.category} 
                          onValueChange={(value) => setNewOrg({...newOrg, category: value as 'institutional' | 'business'})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="business">Business Partner</SelectItem>
                            <SelectItem value="institutional">Institutional Partner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="org-website">Website URL</Label>
                        <Input
                          id="org-website"
                          type="url"
                          value={newOrg.website_url || ''}
                          onChange={(e) => setNewOrg({...newOrg, website_url: e.target.value})}
                          placeholder="https://example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="org-description">Description</Label>
                        <Textarea
                          id="org-description"
                          value={newOrg.description || ''}
                          onChange={(e) => setNewOrg({...newOrg, description: e.target.value})}
                          placeholder="Brief description (optional)"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={addNewOrganization} disabled={!newOrg.name}>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Collaborating with leading global institutions and business partners to deliver strategic insights and solutions
          </p>
        </div>
        
        {/* Business Partners Section */}
        <div className="mb-16">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Briefcase className="h-5 w-5 text-accent" />
            <h3 className="text-xl font-semibold text-foreground">Business Partners</h3>
          </div>
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
              {businessOrgs.map((org) => renderOrganizationCard(org, isEditing))}
            </div>
          </div>
        </div>

        {/* Institutional Partners Section */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Building className="h-5 w-5 text-accent" />
            <h3 className="text-xl font-semibold text-foreground">Institutional Partners</h3>
          </div>
          
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 3000,
                stopOnInteraction: true,
              }),
            ]}
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselContent>
              {institutionalOrgs.map((org) => (
                <CarouselItem key={org.id} className="md:basis-1/3 lg:basis-1/4">
                  {renderOrganizationCard(org, isEditing)}
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Representing strategic partnerships across government, private sector, and international organizations
          </p>
        </div>
      </div>
    </section>
  );
};