import { Button } from "@/components/ui/button";
import { ArrowRight, Globe2, Zap, Clock } from "lucide-react";
import polrydianHeroBg from "@/assets/polrydian-hero-bg.jpg";
import corridorDiagram from "@/assets/corridor-economics-diagram.jpg";
import { PolrydianLogo } from "@/components/PolrydianLogo";
import { ProofChips } from "@/components/ProofChips";
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

        {/* Quote */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <blockquote className="text-xl md:text-2xl text-muted-foreground font-light italic mb-4">
            "The impediment to action advances action. What stands in the way becomes the way."
          </blockquote>
          <cite className="text-foreground text-sm">— Marcus Aurelius</cite>
          
          {/* Strategic thinking image under quote */}
          <div className="mt-6 flex justify-center">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
              <Globe2 className="h-8 w-8 text-accent" />
            </div>
          </div>
        </div>

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
          
          {/* Corridor Economics Explanation with Visual */}
          <div className="bg-background/50 backdrop-blur-sm border border-accent/20 rounded-xl p-6 max-w-4xl mx-auto mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center justify-center gap-2">
              <Globe2 className="h-5 w-5 text-accent" />
              What is Corridor Economics?
            </h3>
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  Corridor economics maps the strategic flows of capital, technology, and expertise between regions to create competitive pathways. 
                  Think of it as building bridges where others see barriers—transforming geopolitical friction into strategic advantage.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">Capital Flows</span>
                  <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">Technology Transfer</span>
                  <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">Strategic Pathways</span>
                </div>
              </div>
              <div className="flex justify-center">
                <img 
                  src={corridorDiagram} 
                  alt="Corridor Economics Network Diagram showing strategic flows between global regions"
                  className="w-full max-w-sm rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>
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