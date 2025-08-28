import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { WhoWeServe } from "@/components/WhoWeServe";
import { OurServices } from "@/components/OurServices";
import { WhyChoosePolrydian } from "@/components/WhyChoosePolrydian";
import { CaseStudiesTestimonials } from "@/components/CaseStudiesTestimonials";
import { LatestInsightsTeaser } from "@/components/LatestInsightsTeaser";
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
            "target": "https://www.polrydian.com/insights?q={query}",
            "query-input": "required name=query"
          }
        })
      }} />

      {/* Professional Service Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          "name": "Polrydian Group Strategic Advisory",
          "description": "Board-level advisory for complex supply chains, deep tech & geopolitics",
          "url": "https://www.polrydian.com",
          "serviceType": ["Strategic Consulting", "Corridor Economics", "Geopolitical Risk Analysis"],
          "areaServed": "Worldwide",
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Strategic Advisory Services",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Corridor Economics Strategy",
                  "description": "Strategic analysis of economic corridors and cross-border trade flows"
                }
              },
              {
                "@type": "Offer", 
                "itemOffered": {
                  "@type": "Service",
                  "name": "Infrastructure & M&A Advisory",
                  "description": "Deal advisory and infrastructure investment strategy"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service", 
                  "name": "Geopolitical & Technology Risk Consulting",
                  "description": "Risk assessment and strategic guidance for complex geopolitical environments"
                }
              }
            ]
          }
        })
      }} />

      {/* Person Schema for Patrick Misiewicz */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Patrick Misiewicz",
          "jobTitle": "Strategic Advisor & Principal",
          "worksFor": {
            "@type": "Organization",
            "name": "Polrydian Group"
          },
          "url": "https://www.polrydian.com/about",
          "sameAs": [
            "https://www.linkedin.com/in/patrick-misiewicz"
          ],
          "knowsAbout": [
            "Corridor Economics",
            "Strategic Consulting", 
            "Geopolitical Analysis",
            "Supply Chain Strategy",
            "Infrastructure Development"
          ]
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
        <section id="who-we-serve" aria-label="Who we serve">
          <WhoWeServe />
        </section>
        <section id="partners" aria-label="Strategic partners" className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <UnifiedOrganizationManager />
          </div>
        </section>
        <section id="services" aria-label="Our services">
          <OurServices />
        </section>
        <section id="why-choose-polrydian" aria-label="Why choose Polrydian">
          <WhyChoosePolrydian />
        </section>
        <section id="case-studies" aria-label="Case studies and testimonials">
          <CaseStudiesTestimonials />
        </section>
        <section id="insights" aria-label="Latest insights">
          <LatestInsightsTeaser />
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
