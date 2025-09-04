import { Navigation } from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ConsentManager } from '@/components/ConsentManager';
import { EnhancedSEO } from '@/components/EnhancedSEO';

export default function CookieSettings() {
  return (
    <div className="min-h-screen bg-background">
      <EnhancedSEO 
        title="Cookie & Privacy Settings | Polrydian Group"
        description="Manage your cookie preferences and privacy settings. Control how your data is collected and used."
        keywords={["privacy", "cookies", "GDPR", "data protection", "consent"]}
        url="/cookie-settings"
        type="website"
      />
      
      <Navigation />
      
      <main role="main" className="py-12">
        <ConsentManager />
      </main>
      
      <Footer />
    </div>
  );
}