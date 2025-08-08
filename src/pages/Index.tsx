import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { Experience } from "@/components/Experience";
import { Contact } from "@/components/Contact";


import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { UnifiedOrganizationManager } from "@/components/UnifiedOrganizationManager";
import Footer from "@/components/Footer";
import { useAnalytics } from "@/hooks/useAnalytics";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { EnhancedSEO } from "@/components/EnhancedSEO";
import heroImage from "@/assets/polrydian-hero-bg.jpg";

const Index = () => {
  const { track } = useAnalytics();


  return (
    <div className="min-h-screen bg-background">
      <EnhancedSEO 
        title="Strategic Consulting & Corridor Economics"
        description="Transforming complexity into strategic clarity. Corridor economics, geopolitics, supply chains, and market entry."
        keywords={["strategic consulting","corridor economics","geopolitics","supply chain","market entry","Polrydian Group","Patrick Misiewicz"]}
        image={heroImage}
        url={`${window.location.origin}/`}
        type="website"
      />
      <a href="#hero" className="skip-link" onClick={() => track('skip_to_content')}>
        Skip to main content
      </a>
      
      <Navigation />
      
      <main role="main">
        <section id="hero" aria-label="Hero section">
          <Hero />
        </section>
        <section id="partners" aria-label="Strategic partners" className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <UnifiedOrganizationManager />
          </div>
        </section>
        <section id="services" aria-label="Services section">
          <Services />
        </section>
        <section id="experience" aria-label="Experience section">
          <Experience />
        </section>
        <section id="contact" aria-label="Contact section">
          <Contact />
        </section>
        <section id="newsletter" aria-label="Newsletter subscription" className="py-16 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto">
              <NewsletterSignup />
            </div>
          </div>
        </section>
      </main>
      
      
      <Footer />
      <PerformanceMonitor />
    </div>
  );
};

export default Index;
