import { AdminLayout } from "@/layouts/AdminLayout"
import { EnhancedSocialMediaDashboard } from "@/components/EnhancedSocialMediaDashboard"
import { EmailServiceSetup } from "@/components/EmailServiceSetup"
import { IntegrationHub } from "@/components/IntegrationHub"
import { IntegrationHealthDashboard } from "@/components/IntegrationHealthDashboard"
import ImageManager from "@/components/ImageManager"
import FredDashboard from "@/components/FredDashboard"
import { BookSeriesManager } from "@/components/BookSeriesManager"
import { PublishingPipeline } from "@/components/PublishingPipeline"
import GalleryManager from "@/components/GalleryManager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Share2, 
  Monitor, 
  Zap, 
  Mail, 
  Image, 
  TrendingUp,
  BookOpen,
  Send,
  Camera
} from "lucide-react"

export default function SocialMediaDashboard() {
  const socialTabs = [
    {
      id: "dashboard",
      label: "Social Dashboard",
      icon: Monitor,
      component: <EnhancedSocialMediaDashboard />
    },
  ];

  const contentTabs = [
    {
      id: "images",
      label: "Media",
      icon: Image,
      component: <ImageManager />
    },
    {
      id: "gallery",
      label: "Gallery", 
      icon: Camera,
      component: <GalleryManager />
    },
    {
      id: "book",
      label: "Books",
      icon: BookOpen,
      component: <BookSeriesManager />
    },
    {
      id: "publishing",
      label: "Publishing",
      icon: Send,
      component: <PublishingPipeline />
    }
  ];

  const systemTabs = [
    {
      id: "hub",
      label: "Integration Hub",
      icon: Monitor,
      component: <IntegrationHub />
    },
    {
      id: "health",
      label: "Health Monitor",
      icon: Monitor,
      component: <IntegrationHealthDashboard />
    },
    {
      id: "email",
      label: "Email",
      icon: Mail,
      component: <EmailServiceSetup />
    },
    {
      id: "fred",
      label: "Economic Data",
      icon: TrendingUp,
      component: <FredDashboard />
    }
  ];

  return (
    <AdminLayout title="Social Media Management">
      <div className="space-y-6">
        {/* Social Media Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Social Media Platforms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-1 mb-6">
                {socialTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              {socialTabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id}>
                  {tab.component}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Content Management Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Content Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="images" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                {contentTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              {contentTabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id}>
                  {tab.component}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* System Integration Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              System Integration & Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="hub" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                {systemTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              {systemTabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id}>
                  {tab.component}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}