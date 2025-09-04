import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Building2, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OurServices = () => {
  const services = [
    {
      icon: Globe,
      title: "Corridor Economics Strategy",
      description: "Strategic mapping and optimization of capital, technology, and expertise flows across global regions for maximum competitive advantage.",
      link: "/services/corridor-economics", // Placeholder link
      highlights: ["Multi-regional project structuring", "Supply chain diversification", "Market entry strategies"]
    },
    {
      icon: Building2,
      title: "Infrastructure & M&A Advisory",
      description: "Complex project structuring and strategic advisory across energy, transportation, and digital infrastructure sectors.",
      link: "/services/infrastructure-ma", // Placeholder link
      highlights: ["Energy infrastructure development", "Cross-border M&A advisory", "Transportation corridor planning"]
    },
    {
      icon: ShieldCheck,
      title: "Geopolitical & Technology Risk Consulting",
      description: "Strategic guidance through complex geopolitical environments and emerging technology landscapes.",
      link: "/services/risk-consulting", // Placeholder link
      highlights: ["Risk analysis & planning", "Policy impact assessment", "Technology integration strategy"]
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-4">
            Comprehensive board-level advisory services designed to navigate complexity 
            and transform challenges into strategic opportunities
          </p>
          <p className="text-sm text-accent font-medium tracking-wide uppercase animate-fade-in">
            Translating complexities into strategic clarity
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="shadow-elegant hover:shadow-glow transition-all duration-300 group border-border/50 hover:border-accent/30 h-full"
            >
              <CardHeader className="pb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-accent/10 to-accent/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                  <service.icon className="h-7 w-7 text-accent" />
                </div>
                <CardTitle className="text-xl text-foreground mb-3">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {service.description}
                </p>
                <ul className="space-y-2 mb-8 flex-grow">
                  {service.highlights.map((highlight, highlightIndex) => (
                    <li key={highlightIndex} className="text-sm text-muted-foreground flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-accent flex-shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="w-full group-hover:bg-accent/10">
                  <Link to={service.link} className="gap-2">
                    Learn More
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Ready to transform your strategic challenges into competitive advantages?
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto">
            <Button asChild size="lg" className="w-full sm:w-auto min-w-[200px]">
              <Link to="/schedule" className="gap-2 flex items-center justify-center">
                Book a Strategy Session
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto min-w-[200px]">
              <Link to="/about" className="gap-2 flex items-center justify-center">
                Learn About Our Approach
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};