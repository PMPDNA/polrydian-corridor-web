import { Button } from "@/components/ui/button";
import { ArrowRight, Globe2, Zap, Clock } from "lucide-react";
import polrydianHeroBg from "@/assets/polrydian-hero-bg.jpg";
import corridorDiagram from "@/assets/corridor-economics-diagram.jpg";
import { PolrydianLogo } from "@/components/PolrydianLogo";
import { ProofChips } from "@/components/ProofChips";
import { StoicQuoteRotator } from "@/components/StoicQuoteRotator";
import { EnhancedCorridorEconomics } from "@/components/EnhancedCorridorEconomics";
import CalendlyPopup from "./CalendlyPopup";
import { LearnMoreModal } from "./LearnMoreModal";
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

        {/* Call to Action - Enhanced Calendly Integration */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="flex justify-center">
            <CalendlyPopup
              calendlyUrl="https://calendly.com/patrick-misiewicz/strategic-consulting-intro-call"
              buttonText="Book a Strategy Session"
              variant="default"
              size="lg"
              className="bg-accent text-accent-foreground px-10 py-6 text-xl shadow-elegant font-semibold hover:bg-accent/90"
              prefill={{
                name: "",
                email: "",
                customAnswers: {
                  "utm_source": "homepage_hero",
                  "utm_campaign": "strategy_session_cta"
                }
              }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Free initial consultation • Priority response for urgent strategic matters
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center text-sm">
            <a href="/services" className="text-accent hover:text-accent/80 underline">
              View Strategic Solutions
            </a>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <a href="/about" className="text-accent hover:text-accent/80 underline">
              Learn About Our Approach
            </a>
          </div>
        </div>
        
        {/* Proof Elements */}
        <ProofChips />

      </div>

    </section>
  );
};