import { AdminLayout } from "@/layouts/AdminLayout"
import { EnhancedPartnerLogosManager } from "@/components/EnhancedPartnerLogosManager"

export default function PartnersManager() {
  return (
    <AdminLayout title="Partners Management">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Manage Partners & Organizations</h2>
          <p className="text-muted-foreground">Upload partner logos, manage their information, and control their visibility on the homepage</p>
        </div>
        
        <EnhancedPartnerLogosManager />
      </div>
    </AdminLayout>
  )
}