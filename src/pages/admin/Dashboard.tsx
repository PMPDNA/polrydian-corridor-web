import { AdminLayout } from "@/layouts/AdminLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"
import { Link } from "react-router-dom"

const quickActions = [
  {
    title: "Edit Hero Section",
    description: "Update main banner and hero content",
    icon: Edit,
    href: "/admin/hero",
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
    href: "/admin/social",
    color: "text-purple-600",
  },
  {
    title: "Photo Gallery",
    description: "Upload and organize photos",
    icon: Camera,
    href: "/admin/gallery",
    color: "text-orange-600",
  },
]

const systemCards = [
  {
    title: "Content Pages",
    description: "Manage all website content",
    items: ["Hero Section", "About Page", "Services", "Contact"],
    icon: Globe,
    href: "/admin/hero",
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
  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
            <Badge variant="outline" className="text-primary">Live Site Control</Badge>
          </div>
          <p className="text-muted-foreground">
            Welcome to the comprehensive admin panel. From here you can manage all aspects of the Polrydian Group website.
          </p>
        </div>

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

        {/* Status Cards */}
        <div>
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Website Status</CardTitle>
                  <Activity className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Online</div>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Social Media</CardTitle>
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">Synced</div>
                <p className="text-xs text-muted-foreground">LinkedIn & Instagram connected</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Security</CardTitle>
                  <Shield className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">Secure</div>
                <p className="text-xs text-muted-foreground">All checks passed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Performance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">Optimal</div>
                <p className="text-xs text-muted-foreground">Fast loading times</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}