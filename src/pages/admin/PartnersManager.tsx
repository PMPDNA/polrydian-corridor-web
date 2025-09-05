import { AdminLayout } from "@/layouts/AdminLayout"
import { PartnerCategoryManager } from "@/components/PartnerCategoryManager"

export default function PartnersManager() {
  return (
    <AdminLayout title="Partners & Categories Management">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Manage Partners & Organizations</h2>
          <p className="text-muted-foreground">Categorize and manage Partners, Affiliations, and Clients with descriptions that appear on hover</p>
        </div>
        
        <PartnerCategoryManager />
      </div>
    </AdminLayout>
  )
}