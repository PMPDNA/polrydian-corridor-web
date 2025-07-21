import { Button } from "@/components/ui/button";
import { ArrowRight, Globe2, Zap, Clock } from "lucide-react";
import polrydianHeroBg from "@/assets/polrydian-hero-bg.jpg";
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
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Strategic consulting with Patrick Misiewicz, Founder of Polrydian Group. Specializing in corridor economics—mapping 
            strategic flows of capital, technology, and expertise to transform complex global challenges into competitive advantages.
          </p>
        </div>

        {/* Call to Action */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/services">
              <Button variant="default" size="lg" className="text-lg px-8 py-6">
                Explore Strategic Solutions
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </a>
            <CalendlyPopup
              calendlyUrl="https://calendly.com/patrickmisiewicz/consultation"
              buttonText="BOOK A STRATEGY SESSION"
              variant="default"
              size="lg"
              className="bg-accent text-white px-8 py-6 text-lg hover:bg-accent/90"
            />
            <CalendlyPopup
              calendlyUrl="https://calendly.com/patrickmisiewicz/emergency-consultation"
              buttonText="Rapid-Response Brief ($500)"
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              prefill={{
                customAnswers: {
                  "emergency_fee": "500",
                  "meeting_type": "emergency"
                }
              }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Emergency meetings available if I'm available • Last minute fee applies
          </p>
        </div>
        
        {/* Proof Elements */}
        <ProofChips />

      </div>

    </section>
  );
};