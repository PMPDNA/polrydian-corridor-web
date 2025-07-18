import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/FileUpload";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Pencil, ExternalLink, Trash2, Building, Briefcase } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

interface Organization {
  id: string;
  name: string;
  logo_url?: string;
  website_url?: string;
  category: 'institutional' | 'business';
  description?: string;
}

export const OrganizationLogos = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([
    // Institutional Partners
    { id: "1", name: "World Affairs Council of Miami", website_url: "https://worldaffairs.miami", category: 'institutional' },
    { id: "2", name: "World Affairs Council of Americas", website_url: "https://worldaffairscouncils.org", category: 'institutional' },
    { id: "3", name: "GMF Marshall Memorial Fellowship", website_url: "https://www.gmfus.org/marshall-memorial-fellowship", category: 'institutional' },
    { id: "4", name: "SIPA FIU", website_url: "https://sipa.fiu.edu", category: 'institutional' },
    { id: "5", name: "Concordia", website_url: "https://www.concordia.net", category: 'institutional' },
    { id: "6", name: "FII Institute", website_url: "https://fii-institute.org", category: 'institutional' },
    { id: "7", name: "NATO", website_url: "https://www.nato.int", category: 'institutional' },
    { id: "8", name: "MDC Honors College", website_url: "https://www.mdc.edu/honorscollege/", category: 'institutional' },
    { id: "9", name: "Forum Americas", website_url: "https://forum-americas.org/conferences/miami/home/", category: 'institutional' },
    { id: "10", name: "American Institute of Polish Culture", website_url: "https://ampolinstitute.com", category: 'institutional' },
    { id: "11", name: "Chopin Foundation of the United States", website_url: "https://www.chopin.org", category: 'institutional' },
    { id: "12", name: "CSIS", website_url: "https://www.csis.org", category: 'institutional' },
    { id: "13", name: "Ministry of Foreign Affairs of Poland", website_url: "https://www.gov.pl/web/diplomacy", category: 'institutional' },
    { id: "14", name: "Embassy of Poland to the United States", website_url: "https://www.gov.pl/web/usa-en/embassy-washington", category: 'institutional' },
    { id: "15", name: "Defense Cooperation Agency University", website_url: "https://dscu.edu", category: 'institutional' },
    
    // Business Partners
    { 
      id: "16", 
      name: "Maven Investment Partners", 
      website_url: "https://mavenip.net", 
      category: 'business',
      description: "Maven Investment Partners is a Middle East based boutique advisory firm comprising of senior industry veterans with extensive experience in Corporate Finance Advisory, M&A Advisory, Transformation & Restructuring Advisory, Interim & Crisis Management and Corporate Governance Initiatives. We partner with shareholders and management teams to help them achieve their strategic objectives."
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
      category: 'business',
      description: "Commercial real estate specializing in warehouses, schools, and international hotels. Working with Sebastian Misiewicz, Principal. Representing both buyers and sellers with deal mandates ranging from $20M to $500M."
    }
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const { toast } = useToast();

  const handleLogoUpload = async (urls: string[], orgId: string) => {
    if (urls.length > 0) {
      const updatedOrgs = organizations.map(org => 
        org.id === orgId ? { ...org, logo_url: urls[0] } : org
      );
      setOrganizations(updatedOrgs);
      toast({
        title: "Logo uploaded successfully",
        description: "The organization logo has been updated.",
      });
    }
  };

  const handleWebsiteUpdate = (orgId: string, websiteUrl: string) => {
    const updatedOrgs = organizations.map(org => 
      org.id === orgId ? { ...org, website_url: websiteUrl } : org
    );
    setOrganizations(updatedOrgs);
    setEditingOrg(null);
    toast({
      title: "Website updated",
      description: "The organization website has been updated.",
    });
  };

  const handleOrgClick = (org: Organization) => {
    if (org.website_url) {
      window.open(org.website_url, '_blank');
    }
  };

  const deleteOrganization = (orgId: string) => {
    setOrganizations(organizations.filter(org => org.id !== orgId));
    toast({
      title: "Organization removed",
      description: "The organization has been removed from the list.",
    });
  };

  const institutionalOrgs = organizations.filter(org => org.category === 'institutional');
  const businessOrgs = organizations.filter(org => org.category === 'business');

  const renderOrganizationCard = (org: Organization) => {
    const CardComponent = (
      <Card 
        key={org.id}
        className={`p-4 flex flex-col items-center justify-center min-h-[150px] transition-all duration-300 bg-background/50 ${
          org.website_url && !isEditing ? 'hover:shadow-lg cursor-pointer hover:bg-background/70' : ''
        }`}
        onClick={() => !isEditing && handleOrgClick(org)}
      >
              {isEditing && (
                <div className="absolute top-2 right-2 flex gap-1">
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
                ) : isEditing ? (
                  <div className="mb-3 w-full">
                    <FileUpload
                      onFilesChange={(urls) => handleLogoUpload(urls, org.id)}
                      multiple={false}
                      accept="image/*"
                      label="Upload Logo"
                      className="text-xs"
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
                  <div className="text-sm">
                    {org.id === "18" ? (
                      <>
                        Commercial real estate specializing in warehouses, schools, and international hotels. Working with Sebastian Misiewicz,{" "}
                        <a 
                          href="https://www.citybiz.co/article/596460/lee-associates-appoints-sebastian-misiewicz-as-principal/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Principal
                        </a>
                        . Representing both buyers and sellers with deal mandates ranging from $20M to $500M.
                      </>
                    ) : (
                      org.description
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return CardComponent;
      };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Strategic Partnerships & Affiliations
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Collaborating with leading global institutions and business partners to deliver strategic insights and solutions
          </p>
          <Button 
            onClick={() => setIsEditing(!isEditing)}
            variant="outline"
            className="mt-4"
          >
            <Pencil className="w-4 h-4 mr-2" />
            {isEditing ? "Done Editing" : "Edit Organizations"}
          </Button>
        </div>
        
        {/* Business Partners Section - Centered at top */}
        <div className="mb-16">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Briefcase className="h-5 w-5 text-accent" />
            <h3 className="text-xl font-semibold text-foreground">Business Partners</h3>
          </div>
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
              {businessOrgs.map((org) => renderOrganizationCard(org))}
            </div>
          </div>
        </div>

        {/* Institutional Partners Section - Carousel */}
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
              {institutionalOrgs.map((org, index) => (
                <CarouselItem key={org.id} className="md:basis-1/3 lg:basis-1/4">
                  {renderOrganizationCard(org)}
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