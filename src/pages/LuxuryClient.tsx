import { Navigation } from "@/components/Navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LuxuryClientDashboard } from "@/components/LuxuryClientDashboard";
import Footer from "@/components/Footer";
import SupabaseProtectedRoute from "@/components/SupabaseProtectedRoute";

const LuxuryClient = () => {
  return (
    <SupabaseProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container mx-auto px-4 pt-24 pb-8">
          <Breadcrumbs />
          <LuxuryClientDashboard />
        </main>
        
        <Footer />
      </div>
    </SupabaseProtectedRoute>
  );
};

export default LuxuryClient;