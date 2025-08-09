import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export function PartnerLogosDisplay() {
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
      <Card>
        <CardHeader>
          <CardTitle>Strategic Partners</CardTitle>
          <CardDescription>
            Organizations and institutions that support our corridor economics research
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const categories = Array.from(new Set(partners.map(p => p.category)));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategic Partners & Affiliations</CardTitle>
        <CardDescription>
          Organizations and institutions that support our corridor economics research and strategic initiatives
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {categories.map(category => {
            const categoryPartners = partners.filter(p => p.category === category);
            
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="capitalize">
                    {category.replace('_', ' ')}
                  </Badge>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {categoryPartners.map(partner => (
                    <div key={partner.id} className="group">
                      <div className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow duration-200">
                        <div className="aspect-square flex items-center justify-center mb-3">
                          {partner.logo_url ? (
                            <img
                              src={partner.logo_url}
                              alt={partner.name}
                              loading="lazy"
                              decoding="async"
                              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`text-center text-muted-foreground text-sm ${partner.logo_url ? 'hidden' : ''}`}>
                            {partner.name}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <h4 className="font-medium text-sm text-foreground mb-1 line-clamp-2">
                            {partner.name}
                          </h4>
                          {partner.description && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {partner.description}
                            </p>
                          )}
                          {partner.website_url && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-xs"
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
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          {partners.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No partner organizations configured yet.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}