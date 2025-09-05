import { PolrydianLogo } from "@/components/PolrydianLogo";
import { ProofChips } from "@/components/ProofChips";
import { StoicQuoteRotator } from "@/components/StoicQuoteRotator";
import { EnhancedCorridorEconomics } from "@/components/EnhancedCorridorEconomics";
import CalendlyPopup from "./CalendlyPopup";
import { trackEvent, trackPerformance } from "@/utils/analytics";
import { useEffect } from "react";

export const Hero = () => {
  useEffect(() => {
    // Track hero section view and performance
    const startTime = performance.now();
    
    trackEvent({
      action: 'hero_view',
      category: 'engagement',
      label: 'homepage_hero'
    });

    // Track time to interactive for hero section
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const loadTime = performance.now() - startTime;
          trackPerformance('hero_load_time', Math.round(loadTime));
          observer.disconnect();
        }
      });
    });

    const heroElement = document.querySelector('#hero-section');
    if (heroElement) {
      observer.observe(heroElement);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="hero-section"
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background pt-20"
      role="banner"
      aria-label="Hero section with company introduction"
    >
      {/* Clean background without blue overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-8">
        {/* Polrydian Logo */}
        <div className="mb-8 animate-fade-in">
          <PolrydianLogo variant="full" size="lg" className="justify-center" />
        </div>

        {/* Rotating Stoic Quotes */}
        <StoicQuoteRotator />

        {/* Main Heading */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Board‑Level Advisory for Complex Supply Chains, Deep Tech & Geopolitics
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6">
            Trusted advisor to sovereign funds, port & logistics operators, defence integrators and deep tech innovators
          </p>
          
          {/* Enhanced Corridor Economics Section */}
          <EnhancedCorridorEconomics />
        </div>
        
        {/* Proof Elements */}
        <ProofChips />

      </div>

    </section>
  );
};