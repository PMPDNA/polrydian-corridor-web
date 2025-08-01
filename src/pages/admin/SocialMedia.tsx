import { AdminLayout } from "@/layouts/AdminLayout"
import { SocialMediaManager } from "@/components/SocialMediaManager"
import ZapierLinkedInIntegration from "@/components/ZapierLinkedInIntegration"
import { InstagramIntegration } from "@/components/InstagramIntegration"
import { EmailServiceSetup } from "@/components/EmailServiceSetup"
import { IntegrationDashboard } from "@/components/IntegrationDashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminSocial() {
  return (
    <AdminLayout title="Social Media Management">
      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="status">Integration Status</TabsTrigger>
          <TabsTrigger value="overview">Social Overview</TabsTrigger>
          <TabsTrigger value="zapier">Zapier LinkedIn</TabsTrigger>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
          <TabsTrigger value="email">Email Setup</TabsTrigger>
        </TabsList>
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
      </Tabs>
    </AdminLayout>
  )
}