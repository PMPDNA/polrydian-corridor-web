import { Button } from "@/components/ui/button";
import { ArrowRight, Globe2, TrendingUp } from "lucide-react";
import polrydianHeroBg from "@/assets/polrydian-hero-bg.jpg";

export const Hero = () => {
  return (
    <section 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(25, 82, 153, 0.9) 0%, rgba(15, 72, 143, 0.8) 50%, rgba(10, 62, 133, 0.9) 100%), url(${polrydianHeroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-hero opacity-90"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Quote */}
        <div className="mb-8 animate-fade-in">
          <blockquote className="text-xl md:text-2xl text-accent font-light italic mb-4">
            "The impediment to action advances action. What stands in the way becomes the way."
          </blockquote>
          <cite className="text-accent-foreground text-sm">— Marcus Aurelius</cite>
        </div>

        {/* Main Heading */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
            Transforming Complexity into 
            <span className="text-accent block mt-2">Strategic Clarity</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed">
            Founder of Polrydian Group specializing in corridor economics—mapping strategic flows of capital, 
            technology, and expertise across critical global regions to transform obstacles into pathways for growth.
          </p>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Button variant="hero" size="lg" className="text-lg px-8 py-6">
            Explore Strategic Solutions
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-accent text-accent hover:bg-accent hover:text-accent-foreground">
            <Globe2 className="h-5 w-5 mr-2" />
            Global Experience
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-in-right" style={{ animationDelay: '0.9s' }}>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-accent mb-2">60+</div>
            <div className="text-primary-foreground/80">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-accent mb-2">15+</div>
            <div className="text-primary-foreground/80">Years Experience</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-accent mb-2">Fortune 500</div>
            <div className="text-primary-foreground/80">Clients</div>
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