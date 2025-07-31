import { AdminLayout } from "@/layouts/AdminLayout"
import { SocialMediaManager } from "@/components/SocialMediaManager"
import ZapierLinkedInIntegration from "@/components/ZapierLinkedInIntegration"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminSocial() {
  return (
    <AdminLayout title="Social Media Management">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="zapier">Zapier LinkedIn</TabsTrigger>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <SocialMediaManager />
        </TabsContent>
        <TabsContent value="zapier">
          <ZapierLinkedInIntegration />
        </TabsContent>
        <TabsContent value="instagram">
          <div className="text-center p-8 text-muted-foreground">
            Instagram integration coming soon...
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  )
}