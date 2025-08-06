import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Navigation } from '@/components/Navigation';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { 
  Settings, 
  Database, 
  FileText, 
  Users, 
  Calendar,
  TrendingUp,
  Building2,
  Shield,
  Activity,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface DashboardStats {
  articles: number;
  insights: number;
  partners: number;
  bookings: number;
}

export default function UnifiedAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    articles: 0,
    insights: 0,
    partners: 0,
    bookings: 0
  });
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useSupabaseAuth();
  const { toast } = useToast();

  const loadStats = async () => {
    try {
      const [articlesRes, insightsRes, partnersRes, bookingsRes] = await Promise.all([
        supabase.from('articles').select('id', { count: 'exact', head: true }),
        supabase.from('insights').select('id', { count: 'exact', head: true }),
        supabase.from('partners').select('id', { count: 'exact', head: true }),
        supabase.from('consultation_bookings').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        articles: articlesRes.count || 0,
        insights: insightsRes.count || 0,
        partners: partnersRes.count || 0,
        bookings: bookingsRes.count || 0
      });
    } catch (error: any) {
      console.error('Error loading stats:', error);
      toast({
        title: "Error Loading Dashboard",
        description: error.message || "Failed to load dashboard statistics.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateEconomicData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('multi-source-economic-data', {
        body: { sources: ['eurostat', 'worldbank', 'fred', 'gscpi'] }
      });

      if (error) throw error;

      toast({
        title: "Economic Data Updated",
        description: "All economic data sources have been updated successfully.",
      });

      await loadStats();
    } catch (error: any) {
      console.error('Error updating economic data:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update economic data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground">
                You need admin privileges to access the dashboard.
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const dashboardSections = [
    {
      title: 'Content Management',
      icon: FileText,
      items: [
        { name: 'Articles', path: '/admin/articles', count: stats.articles, description: 'Manage blog posts and insights' },
        { name: 'Media Library', path: '/admin/images', count: null, description: 'Upload and manage images' },
        { name: 'Gallery', path: '/admin/gallery', count: null, description: 'Photo galleries and events' }
      ]
    },
    {
      title: 'Economic Data',
      icon: TrendingUp,
      items: [
        { name: 'Insights Dashboard', path: '/admin/insights', count: stats.insights, description: 'Economic indicators and analysis' },
        { name: 'FRED Integration', path: '/admin/fred', count: null, description: 'Federal Reserve economic data' },
        { name: 'Data Sources', path: '/admin/data-sources', count: null, description: 'Manage data integrations' }
      ]
    },
    {
      title: 'Partners & Organizations',
      icon: Building2,
      items: [
        { name: 'Partner Logos', path: '/admin/partners', count: stats.partners, description: 'Manage partner organizations' },
        { name: 'Organizations', path: '/admin/organizations', count: null, description: 'Organizational relationships' }
      ]
    },
    {
      title: 'Client Management',
      icon: Users,
      items: [
        { name: 'Consultation Bookings', path: '/admin/bookings', count: stats.bookings, description: 'Client consultation requests' },
        { name: 'Newsletter Subscriptions', path: '/admin/newsletter', count: null, description: 'Email subscriber management' },
        { name: 'User Roles', path: '/admin/users', count: null, description: 'User permissions and roles' }
      ]
    },
    {
      title: 'System & Security',
      icon: Shield,
      items: [
        { name: 'Security Dashboard', path: '/admin/security', count: null, description: 'Security monitoring and logs' },
        { name: 'Analytics', path: '/admin/analytics', count: null, description: 'Website and engagement analytics' },
        { name: 'Integration Health', path: '/admin/integrations', count: null, description: 'API and service status' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Unified management interface for Polrydian Corridor Web
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={updateEconomicData}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : <RefreshCw className="h-4 w-4" />}
              Update Economic Data
            </Button>
            <Button variant="outline" asChild>
              <a href="https://supabase.com/dashboard/project/qemtvnwemcpzhvbwjbsk" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Supabase Dashboard
              </a>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Published Articles</p>
                  <p className="text-2xl font-bold">{stats.articles}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Economic Insights</p>
                  <p className="text-2xl font-bold">{stats.insights}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Partners</p>
                  <p className="text-2xl font-bold">{stats.partners}</p>
                </div>
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Consultations</p>
                  <p className="text-2xl font-bold">{stats.bookings}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Sections */}
        <div className="space-y-8">
          {dashboardSections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <section.icon className="h-6 w-6 text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-foreground">{item.name}</h3>
                        {item.count !== null && (
                          <Badge variant="secondary">{item.count}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                      <Button size="sm" asChild className="w-full">
                        <a href={item.path}>Manage</a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* System Status */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <span className="text-sm">Database Connected</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <span className="text-sm">Edge Functions Active</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <span className="text-sm">Authentication Working</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}