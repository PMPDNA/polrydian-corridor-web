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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {partnerList.map((partner) => (
        <Card key={partner.id} className="group hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-full h-16 flex items-center justify-center bg-white rounded border">
                <img
                  src={partner.logo_url}
                  alt={`${partner.name} logo`}
                  className="max-h-12 max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-sm leading-tight">{partner.name}</h3>
                {partner.website_url && (
                  <a
                    href={partner.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
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
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We collaborate with leading organizations across business and institutional sectors to deliver comprehensive strategic solutions.
          </p>
        </div>

        <div className="space-y-12">
          {partnersList.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-6 text-center">Partners</h3>
              <PartnerGrid partners={partnersList} />
            </div>
          )}

          {affiliationsList.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-6 text-center">Affiliations</h3>
              <PartnerGrid partners={affiliationsList} />
            </div>
          )}

          {clientsList.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-6 text-center">Clients</h3>
              <PartnerGrid partners={clientsList} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}