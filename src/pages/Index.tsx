import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { Experience } from "@/components/Experience";
import { Contact } from "@/components/Contact";


import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { SocialMediaFeed } from "@/components/SocialMediaFeed";
import { LinkedInFeed } from "@/components/LinkedInFeed";
import { UnifiedOrganizationManager } from "@/components/UnifiedOrganizationManager";
import { PromotionalPopup } from "@/components/PromotionalPopup";
import Footer from "@/components/Footer";
import { GDPRConsentManager } from "@/components/GDPRConsentManager";
import { useAnalytics } from "@/hooks/useAnalytics";
import { FredDataDisplay } from "@/components/FredDataDisplay";
import { NewsletterSignup } from "@/components/NewsletterSignup";

const Index = () => {
  const { track } = useAnalytics();


  return (
    <div className="min-h-screen bg-background">
      <a href="#hero" className="skip-link" onClick={() => track('skip_to_content')}>
        Skip to main content
      </a>
      
      <Navigation />
      
      <main role="main">
        <section id="hero" aria-label="Hero section">
          <Hero />
        </section>
        <UnifiedOrganizationManager />
        <section id="insights" aria-label="Economic insights" className="py-20 bg-gradient-to-br from-background via-background/50 to-primary/5">
          <div className="container mx-auto px-6 space-y-12">
            <FredDataDisplay />
            <div className="grid md:grid-cols-2 gap-8">
              <LinkedInFeed />
              <NewsletterSignup variant="compact" />
            </div>
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
      </main>
      
      
      <Footer />
      <PerformanceMonitor />
      <PromotionalPopup />
      <GDPRConsentManager />
    </div>
  );
};

export default Index;
