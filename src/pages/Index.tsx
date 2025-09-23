import { useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { LuxuryHero } from '@/components/LuxuryHero';
import { CredibilityBar } from '@/components/CredibilityBar';
import { CorridorEconomics } from '@/components/CorridorEconomics';
import { FeaturedInsight } from '@/components/FeaturedInsight';
import { InsightsGrid } from '@/components/InsightsGrid';
import { LuxuryServices } from '@/components/LuxuryServices';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { LuxuryFooter } from '@/components/LuxuryFooter';
import { HomePartners } from '@/components/HomePartners';
import { AIChatbot } from '@/components/AIChatbot';
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
        title="Board-Level Advisory for Complex Supply Chains, Deep Tech & Geopolitics"
        description="Trusted advisor to sovereign funds, port & logistics operators, defence integrators and deep tech innovators. Strategic mapping and optimization of capital, technology, and expertise flows across global regions."
        keywords={["corridor economics","board level advisory","supply chain strategy","deep tech consulting","geopolitical risk","infrastructure advisory","Patrick Misiewicz","Polrydian Group"]}
        image={heroImage}
        url={`${getOrigin()}/`}
        type="website"
      />
      
      <Navigation />
      
      <main role="main">
        <section id="hero" aria-label="Hero section">
          <LuxuryHero />
        </section>
        
        <section id="credibility" aria-label="Credibility indicators">
          <CredibilityBar />
        </section>
        
        <section id="corridor-economics" aria-label="Corridor Economics explanation">
          <CorridorEconomics />
        </section>
        
        <section id="featured-insight" aria-label="Featured insight">
          <FeaturedInsight />
        </section>
        
        <section id="insights" aria-label="Latest insights">
          <InsightsGrid />
        </section>
        
        <section id="services" aria-label="Our services">
          <LuxuryServices />
        </section>
        
        <section id="partners" aria-label="Our partners">
          <HomePartners />
        </section>
        
        <section id="newsletter" aria-label="Newsletter signup">
          <NewsletterSignup />
        </section>
      </main>
      
      <LuxuryFooter />
      <AIChatbot />
      <CookieConsentBanner />
    </div>
  );
};

export default Index;