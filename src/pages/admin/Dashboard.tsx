import { AdminLayout } from "@/layouts/AdminLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import TwoFactorSetup from "@/components/TwoFactorSetup"
import { RealTimeDashboard } from "@/components/RealTimeDashboard"
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
    title: "Economic Data",
    description: "FRED economic indicators",
    icon: TrendingUp,
    href: "/admin/fred",
    color: "text-blue-600",
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

        {/* Real-Time Status Dashboard */}
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