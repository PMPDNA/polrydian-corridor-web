import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Image, 
  Share2, 
  BarChart3, 
  FileText, 
  Users, 
  Database,
  Shield,
  Globe,
  Calendar,
  Upload,
  Link as LinkIcon
} from 'lucide-react';
import ImageManager from '@/components/ImageManager';
import { SocialMediaManager } from '@/components/SocialMediaManager';
import ArticleManagerEnhanced from '@/components/ArticleManagerEnhanced';
import FredDashboard from '@/components/FredDashboard';
import { EnhancedAnalyticsDashboard } from '@/components/EnhancedAnalyticsDashboard';
import AdminRoleManager from '@/components/AdminRoleManager';
import { UnifiedOrganizationManager } from '@/components/UnifiedOrganizationManager';
import GalleryManager from '@/components/GalleryManager';
import { ConsultationBookingsManager } from '@/components/ConsultationBookingsManager';

export const UnifiedAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const adminSections = [
    {
      id: 'content',
      label: 'Content Management',
      icon: FileText,
      tabs: [
        { id: 'articles', label: 'Articles', component: <ArticleManagerEnhanced /> },
        { id: 'images', label: 'Images', component: <ImageManager /> },
        { id: 'gallery', label: 'Gallery', component: <GalleryManager /> },
        { id: 'bookings', label: 'Consultation Bookings', component: <ConsultationBookingsManager /> }
      ]
    },
    {
      id: 'social',
      label: 'Social & Media',
      icon: Share2,
      tabs: [
        { id: 'social-media', label: 'Social Media', component: <SocialMediaManager /> },
        { id: 'partners', label: 'Partners', component: <UnifiedOrganizationManager /> }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics & Data',
      icon: BarChart3,
      tabs: [
        { id: 'fred-data', label: 'FRED Data', component: <FredDashboard /> },
        { id: 'site-analytics', label: 'Site Analytics', component: <EnhancedAnalyticsDashboard /> }
      ]
    },
    {
      id: 'system',
      label: 'System Admin',
      icon: Shield,
      tabs: [
        { id: 'user-roles', label: 'User Roles', component: <AdminRoleManager /> }
      ]
    }
  ];

  const quickStats = [
    { label: 'Published Articles', value: '12', icon: FileText, color: 'text-blue-600' },
    { label: 'Social Posts', value: '45', icon: Share2, color: 'text-green-600' },
    { label: 'Partner Logos', value: '8', icon: Users, color: 'text-purple-600' },
    { label: 'FRED Indicators', value: '15', icon: Database, color: 'text-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Polrydian Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Unified management for content, social media, analytics, and system administration
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation Tabs */}
          <div className="border-b">
            <TabsList className="grid grid-cols-4 lg:grid-cols-5 h-auto p-1">
              <TabsTrigger value="overview" className="flex items-center gap-2 py-3">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              {adminSections.map((section) => (
                <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-2 py-3">
                  <section.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{section.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Content Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Published Articles</span>
                    <Badge variant="secondary">12</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Draft Articles</span>
                    <Badge variant="outline">3</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Images Uploaded</span>
                    <Badge variant="secondary">24</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Social Media
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>LinkedIn Connected</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Scheduled Posts</span>
                    <Badge variant="secondary">5</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Auto-Publishing</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col gap-2"
                    onClick={() => setActiveTab('content')}
                  >
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">New Article</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col gap-2"
                    onClick={() => setActiveTab('social')}
                  >
                    <Upload className="h-6 w-6" />
                    <span className="text-sm">Upload Image</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col gap-2"
                    onClick={() => setActiveTab('analytics')}
                  >
                    <BarChart3 className="h-6 w-6" />
                    <span className="text-sm">View Analytics</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col gap-2"
                    onClick={() => setActiveTab('system')}
                  >
                    <Shield className="h-6 w-6" />
                    <span className="text-sm">User Management</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dynamic Section Tabs */}
          {adminSections.map((section) => (
            <TabsContent key={section.id} value={section.id} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <section.icon className="h-5 w-5" />
                    {section.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue={section.tabs[0].id} className="space-y-4">
                    <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${section.tabs.length}, 1fr)` }}>
                      {section.tabs.map((tab) => (
                        <TabsTrigger key={tab.id} value={tab.id}>
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {section.tabs.map((tab) => (
                      <TabsContent key={tab.id} value={tab.id} className="mt-6">
                        {tab.component}
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};