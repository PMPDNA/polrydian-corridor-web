import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus, ExternalLink } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string;
  description?: string;
  category: string;
  display_order: number;
  is_visible: boolean;
}

const CATEGORIES = [
  { value: 'partners', label: 'Strategic Partners' },
  { value: 'affiliations', label: 'Professional Affiliations' },
  { value: 'clients', label: 'Select Clients' }
];

export function PartnerCategoryManager() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    website_url: '',
    description: '',
    category: 'partners',
    display_order: 0,
    is_visible: true
  });

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('category', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error loading partners:', error);
      toast({
        title: "Error",
        description: "Failed to load partners",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('partners')
          .update(formData)
          .eq('id', editingId);
        
        if (error) throw error;
        toast({ title: "Success", description: "Partner updated successfully" });
      } else {
        const { error } = await supabase
          .from('partners')
          .insert(formData);
        
        if (error) throw error;
        toast({ title: "Success", description: "Partner created successfully" });
      }
      
      resetForm();
      loadPartners();
    } catch (error) {
      console.error('Error saving partner:', error);
      toast({
        title: "Error",
        description: "Failed to save partner",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (partner: Partner) => {
    setFormData({
      name: partner.name,
      logo_url: partner.logo_url,
      website_url: partner.website_url || '',
      description: partner.description || '',
      category: partner.category,
      display_order: partner.display_order,
      is_visible: partner.is_visible
    });
    setEditingId(partner.id);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this partner?')) return;
    
    try {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({ title: "Success", description: "Partner deleted successfully" });
      loadPartners();
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast({
        title: "Error",
        description: "Failed to delete partner",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      logo_url: '',
      website_url: '',
      description: '',
      category: 'partners',
      display_order: 0,
      is_visible: true
    });
    setEditingId(null);
    setIsCreating(false);
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const partnersByCategory = CATEGORIES.reduce((acc, category) => {
    acc[category.value] = partners.filter(p => p.category === category.value);
    return acc;
  }, {} as Record<string, Partner[]>);

  if (loading) {
    return <div className="p-6">Loading partners...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Add/Edit Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {editingId ? 'Edit Partner' : 'Add New Partner'}
            </CardTitle>
            {isCreating && (
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </CardHeader>
        {(isCreating || editingId) && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Logo URL</label>
                  <Input
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Website URL</label>
                  <Input
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description (hover tooltip)</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description shown on hover"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Display Order</label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Visibility</label>
                  <Select value={formData.is_visible.toString()} onValueChange={(value) => setFormData({ ...formData, is_visible: value === 'true' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Visible</SelectItem>
                      <SelectItem value="false">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? 'Update Partner' : 'Create Partner'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
        {!isCreating && !editingId && (
          <CardContent>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Partner
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Partners by Category */}
      {CATEGORIES.map(category => (
        <Card key={category.value}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {category.label} ({partnersByCategory[category.value]?.length || 0})
              <Badge variant="outline">{category.value}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {partnersByCategory[category.value]?.length === 0 ? (
              <p className="text-muted-foreground">No partners in this category yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {partnersByCategory[category.value]?.map(partner => (
                  <div key={partner.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={partner.logo_url}
                          alt={partner.name}
                          className="h-8 w-8 object-contain bg-white rounded border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <h3 className="font-medium">{partner.name}</h3>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(partner)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(partner.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {partner.description && (
                      <p className="text-sm text-muted-foreground mb-2">{partner.description}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Order: {partner.display_order}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={partner.is_visible ? "default" : "secondary"}>
                          {partner.is_visible ? "Visible" : "Hidden"}
                        </Badge>
                        {partner.website_url && (
                          <a
                            href={partner.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}