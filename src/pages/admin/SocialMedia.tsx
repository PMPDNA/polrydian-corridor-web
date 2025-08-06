import { AdminLayout } from "@/layouts/AdminLayout"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

export default function AdminSocial() {
  const handleRedirect = () => {
    window.location.href = '/admin/social-dashboard';
  };

  return (
    <AdminLayout title="Social Media Management">
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Social Media Dashboard Has Moved!</h2>
          <p className="text-muted-foreground max-w-md">
            We've reorganized the social media management tools into a more streamlined interface. 
            Click below to access the new dashboard.
          </p>
        </div>
        <Button onClick={handleRedirect} size="lg" className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4" />
          Go to New Social Media Dashboard
        </Button>
      </div>
    </AdminLayout>
  )
}