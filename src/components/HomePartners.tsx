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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {partnerList.map((partner) => (
        <Card key={partner.id} className="group hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-full h-24 flex items-center justify-center bg-white rounded-lg border border-muted/20 p-4">
                <img
                  src={partner.logo_url}
                  alt={`${partner.name} logo`}
                  className="max-h-20 max-w-full object-contain filter hover:grayscale-0 transition-all duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-base leading-tight text-foreground">{partner.name}</h3>
                {partner.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{partner.description}</p>
                )}
                {partner.website_url && (
                  <a
                    href={partner.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit Website
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