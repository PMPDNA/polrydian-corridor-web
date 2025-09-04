import { useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Hero } from '@/components/Hero';
import { WhoWeServe } from '@/components/WhoWeServe';
import { OurServices } from '@/components/OurServices';
import { WhyChoosePolrydian } from '@/components/WhyChoosePolrydian';
import { HomePartners } from '@/components/HomePartners';

import { LatestInsightsTeaser } from '@/components/LatestInsightsTeaser';
import { Contact } from '@/components/Contact';
import Footer from '@/components/Footer';
import { EnhancedSEO } from '@/components/EnhancedSEO';
import { useAnalytics } from '@/hooks/useAnalytics';
import { trackPageView } from '@/utils/analytics';
import { getOrigin } from '@/lib/safe-utils';
import heroImage from '@/assets/polrydian-hero-bg.jpg';

const Index = () => {
  const { track } = useAnalytics();

  useEffect(() => {
    // Track page view with enhanced analytics
    trackPageView('Homepage | Polrydian Group', `${getOrigin()}${window.location.pathname}`);
    
    // Track homepage specific metrics
    const startTime = performance.now();
    
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      track('page_load_complete');
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
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
        
        <section id="who-we-serve" aria-label="Who we serve">
          <WhoWeServe />
        </section>
        
        <section id="services" aria-label="Our services">
          <OurServices />
        </section>
        
        <section id="why-choose-polrydian" aria-label="Why choose Polrydian">
          <WhyChoosePolrydian />
        </section>
        
        <section id="partners" aria-label="Our partners">
          <HomePartners />
        </section>
        
        
        <section id="insights" aria-label="Latest insights">
          <LatestInsightsTeaser />
        </section>
        
        <section id="contact" aria-label="Contact section">
          <Contact />
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;