import { AdminProfileManager } from "@/components/AdminProfileManager";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import SupabaseProtectedRoute from "@/components/SupabaseProtectedRoute";

export default function ProfileManager() {
  return (
    <SupabaseProtectedRoute requireAdmin={true}>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Profile Image Manager
              </h1>
              <p className="text-lg text-muted-foreground">
                Replace the current profile image with your actual photo
              </p>
            </div>
            
            <AdminProfileManager />
            
            <div className="mt-8 p-6 bg-muted/50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Backend Analysis</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Storage:</strong> Uses Supabase Storage 'avatars' bucket (public)</p>
                <p><strong>Database:</strong> Profile URLs stored in 'profiles' table</p>
                <p><strong>Components Using Profile:</strong> AboutBlurb, LinkedInFeed, About page</p>
                <p><strong>Upload Path:</strong> File → Storage → Database → UI Update</p>
                <p><strong>Delete Path:</strong> Clear Database → Delete Storage → Update UI</p>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </SupabaseProtectedRoute>
  );
}