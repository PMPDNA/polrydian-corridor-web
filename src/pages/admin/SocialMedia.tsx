import { AdminLayout } from "@/layouts/AdminLayout"
import { SocialMediaManager } from "@/components/SocialMediaManager"

export default function AdminSocial() {
  return (
    <AdminLayout title="Social Media Management">
      <SocialMediaManager />
    </AdminLayout>
  )
}