import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/layouts/AdminLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import TwoFactorSetup from "@/components/TwoFactorSetup"
import { RealTimeDashboard } from "@/components/RealTimeDashboard"
import { IntegrationHealthMonitor } from "@/components/IntegrationHealthMonitor"
import {
  LayoutDashboard,
  FileText,
  Users,
  Camera,
  MessageSquare,
  TrendingUp,
  Activity,
  Globe,
  Shield,
  Settings,
  Edit,
  Clock,
} from "lucide-react"
import { Link } from "react-router-dom"
import AdminConfigManager from "@/components/AdminConfigManager"
import { AutomatedContentScheduler } from "@/components/AutomatedContentScheduler"

const quickActions = [
  {
    title: "Manage Content",
    description: "Edit hero, pages, and site content",
    icon: Edit,
    href: "/admin/content",
    color: "text-blue-600",
  },
  {
    title: "Manage Articles",
    description: "Create and edit blog articles",
    icon: FileText,
    href: "/admin/articles",
    color: "text-green-600",
  },
  {
    title: "Social Media",
    description: "Sync and manage social posts",
    icon: MessageSquare,
    href: "/admin/social-dashboard",
    color: "text-purple-600",
  },
  {
    title: "Economic Data",
    description: "FRED economic indicators",
    icon: TrendingUp,
    href: "/admin/fred",
    color: "text-blue-600",
  },
  {
    title: "Image Manager",
    description: "Centralized image storage",
    icon: Camera,
    href: "/admin/images",
    color: "text-orange-600",
  },
]

const systemCards = [
  {
    title: "Content Pages",
    description: "Manage all website content",
    items: ["Hero Section", "About Page", "Services", "Contact"],
    icon: Globe,
    href: "/admin/content",
  },
  {
    title: "Media Management",
    description: "Photos, videos, and social media",
    items: ["Photo Gallery", "Instagram Posts", "LinkedIn Articles"],
    icon: Camera,
    href: "/admin/gallery",
  },
  {
    title: "System Admin",
    description: "Security, analytics, and settings",
    items: ["User Management", "Security Logs", "Performance"],
    icon: Settings,
    href: "/security",
  },
]

export default function AdminDashboard() {
  const { user, isAdmin } = useSupabaseAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArticles: 0,
    totalInsights: 0,
    totalBookings: 0,
    activeIntegrations: 0
  });

  // Fetch admin data
  useEffect(() => {
    if (user && isAdmin) {
      fetchAdminData();
    }
  }, [user, isAdmin]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch statistics
      const [
        { count: usersCount },
        { count: articlesCount },
        { count: insightsCount },
        { count: bookingsCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('articles').select('*', { count: 'exact', head: true }),
        supabase.from('insights').select('*', { count: 'exact', head: true }),
        supabase.from('consultation_bookings').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        totalUsers: usersCount || 0,
        totalArticles: articlesCount || 0,
        totalInsights: insightsCount || 0,
        totalBookings: bookingsCount || 0,
        activeIntegrations: 5 // Static for now
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const { toast } = useToast();

  const testFredIntegration = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('fred-api-integration', {
        body: {
          operation: 'fetch_indicators',
          indicators: ['gdp', 'unemployment', 'inflation'],
          limit: 10
        }
      });

      if (error) throw error;

      toast({
        title: "FRED API Test Successful",
        description: `Fetched ${data?.processed_count || 'multiple'} economic indicators`,
        variant: "default"
      });
    } catch (error: any) {
      console.error('FRED API test failed:', error);
      toast({
        title: "FRED API Test Failed",
        description: error.message || "Failed to connect to FRED API",
        variant: "destructive"
      });
    }
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalArticles}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Insights</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInsights}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bookings</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Integrations</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeIntegrations}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions with FRED Test */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Actions & Integration Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link to="/admin/fred">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  FRED Dashboard
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/articles">
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Articles
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin/images">
                  <Camera className="h-4 w-4 mr-2" />
                  Manage Images
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/insights">
                  <Globe className="h-4 w-4 mr-2" />
                  View Insights
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Card key={action.title} className="hover:shadow-md transition-shadow cursor-pointer">
                <Link to={action.href}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <action.icon className={`h-5 w-5 ${action.color}`} />
                      <CardTitle className="text-base">{action.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {action.description}
                    </CardDescription>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* System Overview */}
        <div>
          <h3 className="text-lg font-semibold mb-4">System Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {systemCards.map((card) => (
              <Card key={card.title}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <card.icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                  </div>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {card.items.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                        {item}
                      </div>
                    ))}
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={card.href}>Manage</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Real-Time Status Dashboard */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Real-Time Integration Health</h3>
          <IntegrationHealthMonitor />
        </div>
        
        <RealTimeDashboard />

        {/* Security Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Security Configuration</h3>
            <AdminConfigManager />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Two-Factor Authentication
            </h3>
            <TwoFactorSetup />
          </div>
        </div>

        {/* Content Automation */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Content Automation</h3>
          <AutomatedContentScheduler />
        </div>

        {/* Session Timeout Info */}
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Clock className="h-5 w-5" />
              Session Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-orange-700">
              Your admin session will automatically expire after 1 hour of inactivity. 
              You'll receive a 5-minute warning before automatic logout.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}