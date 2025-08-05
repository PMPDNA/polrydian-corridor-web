import { Button } from "@/components/ui/button";
import { ArrowRight, Globe2, Zap, Clock } from "lucide-react";
import polrydianHeroBg from "@/assets/polrydian-hero-bg.jpg";
import corridorDiagram from "@/assets/corridor-economics-diagram.jpg";
import { PolrydianLogo } from "@/components/PolrydianLogo";
import { ProofChips } from "@/components/ProofChips";
import { StoicQuoteRotator } from "@/components/StoicQuoteRotator";
import { EnhancedCorridorEconomics } from "@/components/EnhancedCorridorEconomics";
import CalendlyPopup from "./CalendlyPopup";

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

        {/* Call to Action - Single Primary CTA */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="flex justify-center">
            <CalendlyPopup
              calendlyUrl="https://calendly.com/patrickmisiewicz/consultation"
              buttonText="Schedule a Strategic Consultation"
              variant="default"
              size="lg"
              className="bg-accent text-white px-10 py-6 text-xl hover:bg-accent/90 shadow-elegant"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Free initial consultation • Emergency sessions available for urgent matters
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center text-sm">
            <a href="/services" className="text-accent hover:text-accent/80 underline">
              View Strategic Solutions
            </a>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <CalendlyPopup
              calendlyUrl="https://calendly.com/patrickmisiewicz/emergency-consultation"
              buttonText="Rapid-Response Brief ($500)"
              variant="ghost"
              size="sm"
              className="text-accent hover:text-accent/80 underline p-0 h-auto"
              prefill={{
                customAnswers: {
                  "emergency_fee": "500",
                  "meeting_type": "emergency"
                }
              }}
            />
          </div>
        </div>
        
        {/* Proof Elements */}
        <ProofChips />

      </div>

    </section>
  );
};