import { useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Hero } from '@/components/Hero';
import { OurServices } from '@/components/OurServices';
import { HomePartners } from '@/components/HomePartners';
import { Contact } from '@/components/Contact';
import Footer from '@/components/Footer';
import { EnhancedSEO } from '@/components/EnhancedSEO';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';
import { useAnalytics } from '@/hooks/useAnalytics';
import { trackPageView } from '@/utils/analytics';
import { getOrigin } from '@/lib/safe-utils';
import heroImage from '@/assets/polrydian-hero-bg.jpg';

const Index = () => {
  const { track } = useAnalytics();

  useEffect(() => {
    // Listen for consent updates
    const handleConsentUpdate = (event: CustomEvent) => {
      if (event.detail.analytics) {
        // Track page view with enhanced analytics only after consent
        trackPageView('Homepage | Polrydian Group', `${getOrigin()}${window.location.pathname}`);
        track('page_load_complete');
      }
    };

    window.addEventListener('consentUpdated', handleConsentUpdate as EventListener);
    
    // Check if consent already exists
    if (window.cookieConsent?.analytics) {
      trackPageView('Homepage | Polrydian Group', `${getOrigin()}${window.location.pathname}`);
    }

    const handleLoad = () => {
      if (window.cookieConsent?.analytics) {
        track('page_load_complete');
      }
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      window.removeEventListener('consentUpdated', handleConsentUpdate as EventListener);
      window.removeEventListener('load', handleLoad);
    };
  }, [track]);

  return (
    <div className="min-h-screen bg-background">
      <EnhancedSEO 
        title="Strategic Consulting & Corridor Economics"
        description="Transforming complexity into strategic clarity. Corridor economics, geopolitics, supply chains, and market entry."
        keywords={["strategic consulting","corridor economics","geopolitics","supply chain","market entry","Polrydian Group","Patrick Misiewicz"]}
        image={heroImage}
        url={`${getOrigin()}/`}
        type="website"
      />
      
      <Navigation />
      
      <main role="main">
        <section id="hero" aria-label="Hero section">
          <Hero />
        </section>
        
        <section id="services" aria-label="Our services">
          <OurServices />
        </section>
        
        <section id="partners" aria-label="Our partners">
          <HomePartners />
        </section>
        
        <section id="contact" aria-label="Contact section">
          <Contact />
        </section>
      </main>
      
      <Footer />
      <CookieConsentBanner />
    </div>
  );
};

export default Index;