import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Ship, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WhoWeServe = () => {
  const clientTypes = [
    {
      icon: Building2,
      title: "Sovereign Funds & Family Offices",
      description: "Strategic investment guidance for complex cross-border opportunities, infrastructure projects, and emerging market entry strategies.",
      link: "/sovereign-funds",
      color: "from-blue-500/10 to-blue-600/10"
    },
    {
      icon: Ship,
      title: "Ports & Logistics Operators",
      description: "Corridor optimization, supply chain diversification, and strategic partnerships for global trade facilitation and port development.",
      link: "/ports-logistics",
      color: "from-green-500/10 to-green-600/10"
    },
    {
      icon: Shield,
      title: "Defence & Deep Tech Companies",
      description: "Technology integration strategies, geopolitical risk assessment, and market entry support for critical infrastructure and defense technologies.",
      link: "/defence-tech",
      color: "from-purple-500/10 to-purple-600/10"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Who We Serve
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            We partner with institutions and enterprises navigating complex global challenges, 
            providing board-level strategic guidance across critical sectors
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {clientTypes.map((client, index) => (
            <Card 
              key={index} 
              className="shadow-elegant hover:shadow-glow transition-all duration-300 group border-border/50 hover:border-accent/30 h-full"
            >
              <CardHeader className="pb-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${client.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300`}>
                  <client.icon className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-xl text-foreground mb-3">{client.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <p className="text-muted-foreground leading-relaxed mb-6 flex-grow">
                  {client.description}
                </p>
                <Button asChild variant="outline" className="w-full group-hover:bg-accent/10">
                  <Link to={client.link} className="gap-2">
                    Learn More
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Looking for strategic guidance tailored to your specific challenges? 
          </p>
          <Button asChild size="lg">
            <Link to="/schedule" className="gap-2">
              Book a Strategy Session
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};