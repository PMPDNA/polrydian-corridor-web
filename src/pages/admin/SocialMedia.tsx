import { AdminLayout } from "@/layouts/AdminLayout"
import { SocialMediaManager } from "@/components/SocialMediaManager"
import ZapierLinkedInIntegration from "@/components/ZapierLinkedInIntegration"
import { InstagramIntegration } from "@/components/InstagramIntegration"
import { EmailServiceSetup } from "@/components/EmailServiceSetup"
import { IntegrationDashboard } from "@/components/IntegrationDashboard"
import { IntegrationHub } from "@/components/IntegrationHub"
import { IntegrationHealthDashboard } from "@/components/IntegrationHealthDashboard"
import ImageManager from "@/components/ImageManager"
import FredDashboard from "@/components/FredDashboard"
import { BookSeriesManager } from "@/components/BookSeriesManager"
import { PublishingPipeline } from "@/components/PublishingPipeline"
import GalleryManager from "@/components/GalleryManager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminSocial() {
  return (
    <AdminLayout title="Social Media Management">
      <Tabs defaultValue="hub" className="w-full">
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12">
          <TabsTrigger value="hub">Integration Hub</TabsTrigger>
          <TabsTrigger value="health">Health Monitor</TabsTrigger>
          <TabsTrigger value="status">Status Dashboard</TabsTrigger>
          <TabsTrigger value="overview">Social Overview</TabsTrigger>
          <TabsTrigger value="zapier">Zapier LinkedIn</TabsTrigger>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
          <TabsTrigger value="email">Email Setup</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="fred">FRED</TabsTrigger>
          <TabsTrigger value="book">Book Series</TabsTrigger>
          <TabsTrigger value="publishing">Publishing</TabsTrigger>
        </TabsList>
        <TabsContent value="hub">
          <IntegrationHub />
        </TabsContent>
        <TabsContent value="health">
          <IntegrationHealthDashboard />
        </TabsContent>
        <TabsContent value="status">
          <IntegrationDashboard />
        </TabsContent>
        <TabsContent value="overview">
          <SocialMediaManager />
        </TabsContent>
        <TabsContent value="zapier">
          <ZapierLinkedInIntegration />
        </TabsContent>
        <TabsContent value="instagram">
          <InstagramIntegration />
        </TabsContent>
        <TabsContent value="email">
          <EmailServiceSetup />
        </TabsContent>
        
          <TabsContent value="images">
            <ImageManager />
          </TabsContent>

          <TabsContent value="gallery">
            <GalleryManager />
          </TabsContent>

          <TabsContent value="fred">
            <FredDashboard />
          </TabsContent>

          <TabsContent value="book">
            <BookSeriesManager />
          </TabsContent>

          <TabsContent value="publishing">
            <PublishingPipeline />
          </TabsContent>
        </Tabs>
    </AdminLayout>
  )
}