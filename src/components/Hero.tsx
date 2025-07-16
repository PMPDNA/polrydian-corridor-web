import { Button } from "@/components/ui/button";
import { ArrowRight, Globe2, TrendingUp } from "lucide-react";
import polrydianHeroBg from "@/assets/polrydian-hero-bg.jpg";
import { PolrydianLogo } from "@/components/PolrydianLogo";

export const Hero = () => {
  return (
    <section 
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background"
    >
      {/* Clean background without blue overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
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
        </div>

        {/* Main Heading */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Transforming Complexity into 
            <span className="text-accent block mt-2">Strategic Clarity</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Founder of Polrydian Group specializing in corridor economics—mapping strategic flows of capital, 
            technology, and expertise across critical global regions to transform obstacles into pathways for growth.
          </p>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <a href="/services">
            <Button variant="default" size="lg" className="text-lg px-8 py-6">
              Explore Strategic Solutions
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </a>
          <a href="#experience">
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-accent text-accent hover:bg-accent hover:text-accent-foreground">
              <Globe2 className="h-5 w-5 mr-2" />
              Global Experience
            </Button>
          </a>
        </div>

        {/* Key Metrics */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-in-right" style={{ animationDelay: '0.9s' }}>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-accent mb-2">60+</div>
            <div className="text-muted-foreground">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-accent mb-2">15+</div>
            <div className="text-muted-foreground">Years Experience</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-accent mb-2">Fortune 500</div>
            <div className="text-muted-foreground">Clients</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-accent rounded-full flex justify-center">
          <div className="w-1 h-3 bg-accent rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
};