import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { Experience } from "@/components/Experience";
import { Contact } from "@/components/Contact";


import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { UnifiedOrganizationManager } from "@/components/UnifiedOrganizationManager";
import PartnerLogos from "@/components/PartnerLogos";
import InsightsDashboard from "@/components/InsightsDashboard";
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
      
      {/* JSON-LD Structured Data for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Polrydian Group",
          "url": "https://www.polrydian.com",
          "logo": "https://www.polrydian.com/static/brand/logo.png",
          "sameAs": [
            "https://www.linkedin.com/company/polrydian",
            "https://x.com/polrydian"
          ],
          "contactPoint": [{
            "@type": "ContactPoint",
            "contactType": "sales",
            "email": "info@polrydian.com",
            "availableLanguage": ["en"]
          }]
        })
      }} />
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "url": "https://www.polrydian.com",
          "name": "Polrydian Group",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://www.polrydian.com/search?q={query}",
            "query-input": "required name=query"
          }
        })
      }} />
      
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
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Strategic Partners</h2>
              <p className="text-lg text-muted-foreground">
                Trusted organizations collaborating to create strategic corridors
              </p>
            </div>
            <PartnerLogos />
          </div>
        </section>
        <section id="insights" aria-label="Economic insights" className="py-16">
          <InsightsDashboard />
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
