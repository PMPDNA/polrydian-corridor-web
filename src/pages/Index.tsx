import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { Experience } from "@/components/Experience";
import { Contact } from "@/components/Contact";
import { TestimonialsSection } from "@/components/TestimonialsSection";

import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { SocialMediaFeed } from "@/components/SocialMediaFeed";
import { LinkedInFeed } from "@/components/LinkedInFeed";
import { UnifiedOrganizationManager } from "@/components/UnifiedOrganizationManager";
import { PromotionalPopup } from "@/components/PromotionalPopup";
import Footer from "@/components/Footer";
import { GDPRConsentManager } from "@/components/GDPRConsentManager";
import { useAnalytics } from "@/hooks/useAnalytics";

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
        {/* Add testimonials after hero */}
        <TestimonialsSection />
        <UnifiedOrganizationManager />
        <section id="social-insights" aria-label="Professional insights" className="py-20 bg-gradient-to-br from-background via-background/50 to-primary/5">
          <div className="container mx-auto px-6">
            <div className="space-y-12">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
                  Professional Insights
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Stay updated with the latest strategic insights and professional thoughts from our leadership team.
                </p>
              </div>
              <LinkedInFeed />
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
