import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useProfileImage } from "@/hooks/useProfileImage";

export const AboutBlurb = () => {
  const { profileImageUrl, isLoading } = useProfileImage();

  return (
    <section className="py-16 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <Card className="border-none shadow-xl bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              {/* Portrait */}
              <div className="flex justify-center md:justify-start">
                <div className="relative">
                  {isLoading ? (
                    <div className="w-48 h-48 rounded-full bg-muted animate-pulse" />
                  ) : (
                    <img 
                      src={profileImageUrl}
                      alt="Patrick Misiewicz - Geopolitical Advisor & Founder"
                      className="w-48 h-48 rounded-full object-cover shadow-lg border-4 border-accent/20"
                    />
                  )}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-accent/10"></div>
                </div>
              </div>
              
              {/* Content */}
              <div className="md:col-span-2 text-center md:text-left">
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Meet Patrick Misiewicz
                </h2>
                <h3 className="font-sans text-lg text-primary font-semibold mb-4">
                  Geopolitical Advisor & Founder
                </h3>
                
                <p className="font-sans text-lg text-muted-foreground leading-relaxed mb-6">
                  With over a decade of experience navigating the complex intersections of 
                  geopolitics, economics, and strategy, Patrick has advised Fortune 500 companies 
                  and sovereign entities across 65+ countries. His expertise in corridor economics 
                  and transatlantic relations provides clients with unparalleled insights into 
                  global market dynamics.
                </p>
                
                <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    Corridor Economics
                  </span>
                  <span className="px-3 py-1 bg-accent/10 text-accent-foreground rounded-full text-sm font-medium">
                    Strategic Advisory
                  </span>
                  <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm font-medium">
                    Geopolitical Risk
                  </span>
                </div>
                
                <Button 
                  asChild
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Link to="/about">
                    Learn More About Patrick
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};