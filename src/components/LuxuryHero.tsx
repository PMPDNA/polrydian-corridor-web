import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export const LuxuryHero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Sophisticated background with subtle texture */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-muted/20 to-accent/10"></div>
      </div>
      
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background/20"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center pt-20">
        {/* Main heading with luxury typography */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-6 leading-tight tracking-tight">
            Geopolitical Foresight
            <br />
            <span className="text-primary">for a Connected World</span>
          </h1>
          
          <p className="font-sans text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
            Polrydian provides high-end geopolitical consulting focused on 
            <br className="hidden md:block" />
            <strong className="text-foreground">transatlantic economic corridors</strong>
          </p>
        </div>

        {/* Call-to-action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Button 
            asChild
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 text-lg rounded-md shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link to="/schedule">
              Request a Consultation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          
          <Button 
            asChild
            variant="outline" 
            size="lg"
            className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground font-semibold px-8 py-4 text-lg rounded-md transition-all duration-300"
          >
            <Link to="/articles">
              Explore Insights
            </Link>
          </Button>
        </div>

        {/* Subtle location indicator */}
        <div className="flex items-center justify-center text-muted-foreground animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <MapPin className="h-4 w-4 mr-2" />
          <span className="font-sans text-sm">Miami • Warsaw • Global Reach</span>
        </div>
      </div>
    </section>
  );
};