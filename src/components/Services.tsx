import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Globe, 
  TrendingUp, 
  Building2, 
  Wheat, 
  Plane, 
  ShieldCheck,
  ArrowRight,
  Target
} from "lucide-react";

export const Services = () => {
  const services = [
    {
      icon: Globe,
      title: "Corridor Economics",
      description: "Strategic mapping and management of capital, technology, and expertise flows across global regions.",
      features: [
        "Multi-regional project structuring",
        "Supply chain diversification",
        "Market entry strategies",
        "Risk assessment & mitigation"
      ]
    },
    {
      icon: Building2,
      title: "Infrastructure & M&A",
      description: "Complex project structuring across energy, transportation, and digital infrastructure sectors.",
      features: [
        "Energy infrastructure development",
        "Transportation corridor planning",
        "Digital infrastructure strategy",
        "Cross-border M&A advisory"
      ]
    },
    {
      icon: Wheat,
      title: "Food Security & Agritech",
      description: "Agricultural technology integration and food supply chain security frameworks.",
      features: [
        "Smallholder farmer onboarding",
        "Export capacity building",
        "Technology integration",
        "Supply chain guarantee systems"
      ]
    },
    {
      icon: Plane,
      title: "Aviation & Logistics",
      description: "Air connectivity facilitation and strategic logistics optimization.",
      features: [
        "Route development consulting",
        "Port diversification strategy",
        "Logistics network optimization",
        "International partnership facilitation"
      ]
    },
    {
      icon: ShieldCheck,
      title: "Geopolitical Strategy",
      description: "Strategic guidance through complex geopolitical environments and policy landscapes.",
      features: [
        "Risk analysis & planning",
        "Policy impact assessment",
        "Stakeholder engagement",
        "Crisis management"
      ]
    },
    {
      icon: Target,
      title: "Economic Development",
      description: "Comprehensive economic mobility ecosystem development and strategic partnerships.",
      features: [
        "Public-private partnerships",
        "University-industry collaboration",
        "Investment facilitation",
        "Capacity building programs"
      ]
    }
  ];

  return (
    <section id="services" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Strategic Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Comprehensive solutions for navigating complex global challenges and transforming 
            obstacles into strategic opportunities
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="shadow-elegant hover:shadow-glow transition-all duration-300 group border-border/50 hover:border-accent/30"
            >
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors duration-300">
                  <service.icon className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-xl text-foreground">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="text-sm text-muted-foreground flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="shadow-elegant bg-gradient-to-r from-primary/5 to-accent/5 border-accent/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                Ready to Transform Your Strategic Challenges?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Let's clearly define your strategic challenges and craft the corridor that 
                decisively moves your ambitions forward.
              </p>
              <Button variant="hero" size="lg" className="text-lg px-8 py-6">
                Schedule Strategic Consultation
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};