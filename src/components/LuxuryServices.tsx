import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Route, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const LuxuryServices = () => {
  const services = [
    {
      icon: <Route className="w-8 h-8" />,
      title: "Corridor Economics Strategy",
      description: "Strategic mapping and optimization of capital, technology, and expertise flows across global regions for maximum competitive advantage.",
      features: [
        "Multi-regional project structuring",
        "Supply chain diversification", 
        "Market entry strategies"
      ],
      link: "/services#corridor-economics"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Infrastructure & M&A Advisory",
      description: "Complex project structuring and strategic advisory across energy, transportation, and digital infrastructure sectors.",
      features: [
        "Energy infrastructure development",
        "Cross-border M&A advisory",
        "Transportation corridor planning"
      ],
      link: "/services#infrastructure-ma"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Geopolitical & Technology Risk Consulting",
      description: "Strategic guidance through complex geopolitical environments and emerging technology landscapes.",
      features: [
        "Risk analysis & planning",
        "Policy impact assessment",
        "Technology integration strategy"
      ],
      link: "/services#geopolitical-tech"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-sans text-4xl md:text-5xl font-bold text-foreground mb-6">
            Our Services
          </h2>
          <p className="font-sans text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-4">
            Comprehensive board-level advisory services designed to navigate complexity and transform challenges into strategic opportunities
          </p>
          <p className="font-sans text-lg text-primary font-semibold">
            Translating complexities into strategic clarity
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <Card key={index} className="group relative overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border-none bg-card/90 backdrop-blur-sm">
              <CardContent className="p-8 text-left">
                {/* Icon with gradient background */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <h3 className="font-serif text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                
                <p className="font-sans text-muted-foreground leading-relaxed mb-6">
                  {service.description}
                </p>
                
                {service.features && (
                  <ul className="list-disc list-inside text-sm text-muted-foreground mb-6 space-y-1">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex}>{feature}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
              
              {/* Subtle gradient border effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-6">
            Ready to transform your strategic challenges into competitive advantages?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4"
            >
              <Link to="/services">
                Learn More
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              asChild
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-4"
            >
              <Link to="/schedule">
                Book a Strategy Session
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              asChild
              size="lg"
              variant="outline"
              className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground px-8 py-4"
            >
              <Link to="/about">
                Learn About Our Approach
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};