import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string;
  description?: string;
  category: string;
  display_order: number;
}

export function HomePartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('is_visible', true)
        .order('display_order');

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error loading partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const partnersList = partners.filter(p => p.category === 'partners');
  const affiliationsList = partners.filter(p => p.category === 'affiliations');  
  const clientsList = partners.filter(p => p.category === 'clients');

  console.log('Partners:', partnersList.length, 'Affiliations:', affiliationsList.length, 'Clients:', clientsList.length);

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <LoadingSpinner />
          </div>
        </div>
      </section>
    );
  }

  if (partnersList.length === 0 && affiliationsList.length === 0 && clientsList.length === 0) {
    return null;
  }

  const PartnerGrid = ({ partners: partnerList }: { partners: Partner[] }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {partnerList.map((partner) => (
        <Card key={partner.id} className="group hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div 
                className="w-full h-32 flex items-center justify-center bg-white rounded-lg border border-muted/20 p-4 relative"
                title={partner.description || partner.name}
              >
                <img
                  src={partner.logo_url}
                  alt={`${partner.name} logo`}
                  className="max-h-28 max-w-full object-contain transition-all duration-300 mx-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {/* Improved hover tooltip */}
                {partner.description && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-3 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 max-w-lg w-96 text-left shadow-lg">
                    <div className="font-semibold mb-1">{partner.name}</div>
                    <div className="text-xs leading-relaxed text-gray-200">
                      {partner.description}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
              <div className="space-y-2 text-center">
                <h3 className="font-semibold text-base leading-tight text-foreground text-center">{partner.name}</h3>
                {partner.website_url && (
                  <a
                    href={partner.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Partners</h2>
        </div>

        <div className="space-y-16">
          {partnersList.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold mb-8 text-center text-foreground">Strategic Partners</h3>
              <PartnerGrid partners={partnersList} />
            </div>
          )}

          {affiliationsList.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold mb-8 text-center text-foreground">Professional Affiliations</h3>
              <PartnerGrid partners={affiliationsList} />
            </div>
          )}

          {clientsList.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold mb-8 text-center text-foreground">Select Clients</h3>
              <PartnerGrid partners={clientsList} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}