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

  // Separate strategic partners from institutional partners
  const strategicPartners = partners.filter(p => 
    p.category === 'strategic' || p.category === 'investment' || p.category === 'real_estate' || 
    ['Maven Investment Partners', 'KCC Capital', 'Lee & Associates'].some(name => 
      p.name.toLowerCase().includes(name.toLowerCase())
    ) ||
    // Include all current partners as strategic for now since they're all category "partner"
    (p.category === 'partner' && ['Maven', 'KCC', 'Lee'].some(keyword => 
      p.name.toLowerCase().includes(keyword.toLowerCase())
    ))
  );

  const institutionalPartners = partners.filter(p => 
    p.category === 'institutional' || p.category === 'fellowship' || p.category === 'think_tank' ||
    ['GMF Marshall Memorial Fellowship', 'World Affairs Council of Miami'].some(name => 
      p.name.toLowerCase().includes(name.toLowerCase())
    ) ||
    // Add any partners that aren't strategic as institutional
    (p.category === 'partner' && !['Maven', 'KCC', 'Lee'].some(keyword => 
      p.name.toLowerCase().includes(keyword.toLowerCase())
    ))
  );

  return (
    <div className="w-full space-y-16">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Strategic Partners
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Trusted organizations collaborating to create strategic corridors
        </p>
      </div>

      {/* Strategic Partners Section */}
      {strategicPartners.length > 0 && (
        <div className="space-y-8">          
          <div className="flex justify-center items-center gap-8 md:gap-16 flex-wrap">
            {strategicPartners.map(partner => (
              <div key={partner.id} className="group cursor-pointer">
                {partner.website_url ? (
                  <a
                    href={partner.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-all duration-200 flex items-center justify-center group-hover:scale-105">
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
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-lg p-6 shadow-sm border flex items-center justify-center">
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

      {/* Institutional Partners Section */}
      {institutionalPartners.length > 0 && (
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Institutional Partners
            </h3>
            <p className="text-muted-foreground">
              Academic and research institutions advancing corridor economics
            </p>
          </div>
          
          <div className="flex justify-center items-center gap-8 md:gap-16 flex-wrap">
            {institutionalPartners.map(partner => (
              <div key={partner.id} className="group cursor-pointer">
                {partner.website_url ? (
                  <a
                    href={partner.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-all duration-200 flex items-center justify-center group-hover:scale-105">
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
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-lg p-6 shadow-sm border flex items-center justify-center">
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

      {partners.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No partner organizations configured yet.</p>
        </div>
      )}
    </div>
  );
}