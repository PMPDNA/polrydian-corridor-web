import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

export function EnhancedPartnerDisplay() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching partners:', error);
        return;
      }

      setPartners(data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Strategic Partners & Organizations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Building strategic partnerships across global institutions to advance corridor economics research and implementation.
          </p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Separate strategic partners from affiliations
  const strategicPartners = partners.filter(p => 
    p.category === 'investment' || p.category === 'real_estate' || 
    ['Maven Investment Partners', 'KCC Capital', 'Lee & Associates'].some(name => 
      p.name.toLowerCase().includes(name.toLowerCase())
    )
  );

  const affiliations = partners.filter(p => 
    !strategicPartners.some(sp => sp.id === p.id)
  );

  return (
    <div className="w-full space-y-16">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Strategic Partners & Organizations
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Building strategic partnerships across global institutions to advance corridor economics research and implementation.
        </p>
      </div>

      {/* Strategic Partners Section */}
      {strategicPartners.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <Badge variant="outline" className="text-sm px-4 py-2">
              Strategic Partners
            </Badge>
          </div>
          
          <div className="flex justify-center items-center gap-8 md:gap-12">
            {strategicPartners.map(partner => (
              <div key={partner.id} className="group cursor-pointer">
                {partner.website_url ? (
                  <a
                    href={partner.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-all duration-200 flex items-center justify-center group-hover:scale-105">
                      {partner.logo_url ? (
                        <img
                          src={partner.logo_url}
                          alt={partner.name}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`text-center text-muted-foreground text-xs ${partner.logo_url ? 'hidden' : ''}`}>
                        {partner.name}
                      </div>
                    </div>
                  </a>
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-lg p-4 shadow-sm border flex items-center justify-center">
                    {partner.logo_url ? (
                      <img
                        src={partner.logo_url}
                        alt={partner.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`text-center text-muted-foreground text-xs ${partner.logo_url ? 'hidden' : ''}`}>
                      {partner.name}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Affiliations Carousel Section */}
      {affiliations.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <Badge variant="outline" className="text-sm px-4 py-2">
              Affiliations
            </Badge>
          </div>
          
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll space-x-8">
              {[...affiliations, ...affiliations].map((partner, index) => (
                <div key={`${partner.id}-${index}`} className="flex-shrink-0 group">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-lg p-3 shadow-sm border hover:shadow-md transition-all duration-200 flex items-center justify-center group-hover:scale-105">
                    {partner.logo_url ? (
                      <img
                        src={partner.logo_url}
                        alt={partner.name}
                        className="max-w-full max-h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`text-center text-muted-foreground text-xs ${partner.logo_url ? 'hidden' : ''}`}>
                      {partner.name}
                    </div>
                  </div>
                  {partner.website_url && (
                    <div className="text-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        asChild
                      >
                        <a
                          href={partner.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Visit
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {partners.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No partner organizations configured yet.</p>
        </div>
      )}
    </div>
  );
}