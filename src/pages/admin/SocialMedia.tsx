import { AdminLayout } from "@/layouts/AdminLayout"
import { SocialMediaManager } from "@/components/SocialMediaManager"
import LinkedInIntegration from "@/components/LinkedInIntegration"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminSocial() {
  return (
    <AdminLayout title="Social Media Management">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn Integration</TabsTrigger>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <SocialMediaManager />
        </TabsContent>
        <TabsContent value="linkedin">
          <LinkedInIntegration />
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