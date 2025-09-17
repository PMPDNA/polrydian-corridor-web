import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Route, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const LuxuryServices = () => {
  const services = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Strategic Advisory",
      description: "Navigate complex geopolitical landscapes with data-driven insights and proven frameworks for sustainable growth.",
      link: "/services#strategic-advisory"
    },
    {
      icon: <Route className="w-8 h-8" />,
      title: "Corridor Development",
      description: "Optimize economic corridors and trade routes to unlock new markets and enhance operational efficiency.",
      link: "/services#corridor-development"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Speaking & Briefings",
      description: "Executive briefings and keynote presentations on global economic trends and geopolitical risk assessment.",
      link: "/services#speaking-briefings"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-sans text-4xl md:text-5xl font-bold text-foreground mb-6">
            Our Services
          </h2>
          <p className="font-sans text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Comprehensive strategic consulting services designed to transform 
            complexity into competitive advantage
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <Card key={index} className="group relative overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border-none bg-card/90 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                {/* Icon with gradient background */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <div className="absolute inset-0 w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <h3 className="font-sans text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                
                <p className="font-sans text-muted-foreground leading-relaxed mb-6">
                  {service.description}
                </p>
                
                <Button 
                  asChild
                  variant="ghost" 
                  className="text-primary hover:text-primary-foreground hover:bg-primary font-medium"
                >
                  <Link to={service.link}>
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
              
              {/* Subtle gradient border effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Button 
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4"
          >
            <Link to="/services">
              View All Services
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};