import { AdminLayout } from '@/layouts/AdminLayout'
import { SystemStressTestDashboard } from '@/components/SystemStressTestDashboard'

export default function StressTestPage() {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <SystemStressTestDashboard />
      </div>
    </AdminLayout>
  )
}