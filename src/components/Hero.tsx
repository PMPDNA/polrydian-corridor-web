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

export const Hero = () => {
  return (
    <section 
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background pt-20"
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
            Transforming Complexity into 
            <span className="text-accent block mt-2">Strategic Clarity</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6">
            Strategic consulting with Patrick Misiewicz, Founder of Polrydian Group. Specializing in corridor economics—mapping 
            strategic flows of capital, technology, and expertise to transform complex global challenges into competitive advantages.
          </p>
          
          {/* Enhanced Corridor Economics Section */}
          <EnhancedCorridorEconomics />
        </div>

        {/* Call to Action - Contact Form Integration */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="flex justify-center">
            <a 
              href="https://calendly.com/patrick-misiewicz/strategic-consulting-intro-call" 
              className="inline-flex items-center justify-center bg-accent text-accent-foreground px-10 py-6 text-xl rounded-lg hover:bg-accent/90 shadow-elegant transition-colors font-semibold"
            >
              Schedule Strategic Consultation
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
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