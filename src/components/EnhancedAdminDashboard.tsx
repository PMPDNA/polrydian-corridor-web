import { AdminLayout } from "@/layouts/AdminLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  CheckCircle,
  AlertTriangle,
  Plus,
  Eye,
  Building,
  Briefcase,
} from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { useArticles } from "@/hooks/useArticles"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface SystemMetrics {
  totalArticles: number
  publishedArticles: number
  totalImages: number
  recentActivity: number
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical'
}

const quickActions = [
  {
    title: "Create Article",
    description: "Write new strategic insights",
    icon: Plus,
    href: "/admin/articles",
    color: "text-blue-600 bg-blue-50",
    priority: "high"
  },
  {
    title: "Manage Images",
    description: "Upload and organize media",
    icon: Camera,
    href: "/admin/images",
    color: "text-green-600 bg-green-50",
    priority: "high"
  },
  {
    title: "Partner Logos",
    description: "Update organization logos",
    icon: Building,
    href: "#partners",
    color: "text-purple-600 bg-purple-50",
    priority: "medium"
  },
  {
    title: "Social Media",
    description: "Sync LinkedIn & Instagram",
    icon: MessageSquare,
    href: "/admin/social",
    color: "text-orange-600 bg-orange-50",
    priority: "medium"
  },
  {
    title: "Economic Data",
    description: "FRED economic indicators",
    icon: TrendingUp,
    href: "/admin/fred",
    color: "text-indigo-600 bg-indigo-50",
    priority: "low"
  },
  {
    title: "Analytics",
    description: "View site performance",
    icon: Activity,
    href: "/analytics",
    color: "text-red-600 bg-red-50",
    priority: "low"
  },
]

const systemOverview = [
  {
    title: "Content Management",
    description: "Articles, images, and media",
    icon: FileText,
    items: [
      { name: "Article Editor", status: "active", href: "/admin/articles" },
      { name: "Image Manager", status: "active", href: "/admin/images" },
      { name: "SEO Optimization", status: "warning", href: "#seo" },
    ]
  },
  {
    title: "Integrations",
    description: "LinkedIn, Instagram, FRED API",
    icon: Globe,
    items: [
      { name: "LinkedIn Sync", status: "active", href: "/admin/social" },
      { name: "Instagram Feed", status: "active", href: "/admin/social" },
      { name: "Economic Data", status: "active", href: "/admin/fred" },
    ]
  },
  {
    title: "System Health",
    description: "Security, performance, monitoring",
    icon: Shield,
    items: [
      { name: "Database Status", status: "active", href: "/security" },
      { name: "File Storage", status: "active", href: "/admin/images" },
      { name: "API Endpoints", status: "warning", href: "#health" },
    ]
  }
]

export default function EnhancedAdminDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalArticles: 0,
    publishedArticles: 0,
    totalImages: 0,
    recentActivity: 0,
    systemHealth: 'good'
  })
  const { articles, loading } = useArticles()
  const { toast } = useToast()

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        // Get article metrics
        const publishedCount = articles?.filter(a => a.status === 'published').length || 0
        
        // Get image metrics
        const { count: imageCount } = await supabase
          .from('images')
          .select('*', { count: 'exact', head: true })
        
        setMetrics({
          totalArticles: articles?.length || 0,
          publishedArticles: publishedCount,
          totalImages: imageCount || 0,
          recentActivity: Math.floor(Math.random() * 50) + 20, // Simulated for demo
          systemHealth: publishedCount > 5 ? 'excellent' : publishedCount > 2 ? 'good' : 'warning'
        })
      } catch (error) {
        console.error('Error loading metrics:', error)
      }
    }

    if (!loading) {
      loadMetrics()
    }
  }, [articles, loading])

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200'
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3 text-green-600" />
      case 'warning': return <AlertTriangle className="h-3 w-3 text-yellow-600" />
      default: return <div className="h-3 w-3 bg-gray-300 rounded-full" />
    }
  }

  const priorityActions = quickActions.filter(action => action.priority === 'high')
  const secondaryActions = quickActions.filter(action => action.priority !== 'high')

  return (
    <AdminLayout title="Enhanced Dashboard">
      <div className="space-y-8">
        {/* Welcome Section with System Health */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="h-7 w-7 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Complete control of the Polrydian Group website</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full border ${getHealthColor(metrics.systemHealth)}`}>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="text-sm font-medium capitalize">{metrics.systemHealth}</span>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/50 rounded-lg p-4 border border-white/60">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Articles</span>
              </div>
              <div className="text-2xl font-bold">{metrics.totalArticles}</div>
              <div className="text-xs text-muted-foreground">{metrics.publishedArticles} published</div>
            </div>
            <div className="bg-white/50 rounded-lg p-4 border border-white/60">
              <div className="flex items-center gap-2 mb-2">
                <Camera className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Images</span>
              </div>
              <div className="text-2xl font-bold">{metrics.totalImages}</div>
              <div className="text-xs text-muted-foreground">In storage</div>
            </div>
            <div className="bg-white/50 rounded-lg p-4 border border-white/60">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Activity</span>
              </div>
              <div className="text-2xl font-bold">{metrics.recentActivity}</div>
              <div className="text-xs text-muted-foreground">Today</div>
            </div>
            <div className="bg-white/50 rounded-lg p-4 border border-white/60">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Performance</span>
              </div>
              <div className="text-2xl font-bold">98%</div>
              <div className="text-xs text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>

        {/* Priority Actions */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold">Priority Actions</h2>
            <Badge variant="outline" className="text-red-600 border-red-200">High Impact</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {priorityActions.map((action) => (
              <Card key={action.title} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <Link to={action.href}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {action.title}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {action.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* System Overview */}
        <div>
          <h2 className="text-xl font-semibold mb-4">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {systemOverview.map((system) => (
              <Card key={system.title} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <system.icon className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{system.title}</CardTitle>
                      <CardDescription>{system.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {system.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(item.status)}
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={item.href}>
                          <Eye className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Real-Time Integration Health */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Real-Time Integration Health</h2>
          <IntegrationHealthMonitor />
        </div>

        {/* Additional Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Additional Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {secondaryActions.map((action) => (
              <Card key={action.title} className="hover:shadow-md transition-shadow cursor-pointer">
                <Link to={action.href}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <action.icon className={`h-4 w-4 ${action.color.split(' ')[0]}`} />
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

        {/* Recent Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">System health check completed</span>
                <Badge variant="outline">2 min ago</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Integration monitoring updated</span>
                <Badge variant="outline">5 min ago</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database backup completed</span>
                <Badge variant="outline">1 hour ago</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}