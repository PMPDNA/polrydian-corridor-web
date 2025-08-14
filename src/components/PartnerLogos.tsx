import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Partner {
  id: string;
  name: string;
  website_url?: string;
  logo_url: string;
  description?: string;
}

export default function PartnerLogos() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse bg-muted rounded-lg h-20" />
        ))}
      </div>
    );
  }

  if (partners.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No partner logos available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center">
      {partners.map((partner) => (
        <div
          key={partner.id}
          className="flex items-center justify-center p-4 rounded-lg border bg-background hover:bg-accent/5 transition-colors"
        >
          {partner.website_url ? (
            <a
              href={partner.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full flex items-center justify-center"
            >
              <img
                src={partner.logo_url}
                alt={partner.name}
                className="max-h-12 max-w-full object-contain filter hover:brightness-110 transition-all"
                loading="lazy"
              />
            </a>
          ) : (
            <img
              src={partner.logo_url}
              alt={partner.name}
              className="max-h-12 max-w-full object-contain"
              loading="lazy"
            />
          )}
        </div>
      ))}
    </div>
  );
}