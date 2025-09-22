import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PolrydianLogo } from "@/components/PolrydianLogo";
import { StoicQuoteRotator } from "@/components/StoicQuoteRotator";

export const LuxuryHero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Professional background with subtle gradient */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-primary"></div>
      </div>
      
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background/20"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center pt-20">
        {/* Polrydian Logo */}
        <div className="mb-8 animate-fade-in">
          <PolrydianLogo variant="text" size="lg" className="justify-center mb-6" />
        </div>

        {/* Stoic Quote */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <StoicQuoteRotator />
        </div>

        {/* Main heading with professional typography */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight tracking-tight">
            Board-Level Advisory
            <br />
            <span className="text-foreground">for Complex Supply Chains,</span>
            <br />
            <span className="text-primary">Deep Tech & Geopolitics</span>
          </h1>
          
          <p className="font-sans text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
            Trusted advisor to sovereign funds, port & logistics operators, 
            <br className="hidden md:block" />
            defence integrators and deep tech innovators
          </p>
        </div>

        {/* Call-to-action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Button 
            asChild
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 text-lg rounded-md shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link to="/schedule">
              Book a Strategy Session
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          
          <Button 
            asChild
            variant="outline" 
            size="lg"
            className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8 py-4 text-lg rounded-md transition-all duration-300"
          >
            <Link to="/services">
              Learn More
            </Link>
          </Button>
          
          <Button 
            asChild
            variant="outline" 
            size="lg"
            className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground font-semibold px-8 py-4 text-lg rounded-md transition-all duration-300"
          >
            <Link to="/about">
              Learn About Our Approach
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};