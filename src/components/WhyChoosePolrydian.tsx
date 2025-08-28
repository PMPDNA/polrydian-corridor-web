import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Globe, TrendingUp, Users } from 'lucide-react';

export const WhyChoosePolrydian = () => {
  const accomplishments = [
    "Closed over $50M in real estate deals across multiple markets",
    "Built cross-border economic projects spanning three continents", 
    "Serving on the World Affairs Council of Miami",
    "Advised sovereign funds and family offices on strategic investments",
    "Developed corridor economics frameworks for port operators",
    "Led geopolitical risk assessments for deep tech companies"
  ];

  const differentiators = [
    {
      icon: Globe,
      title: "Systems Thinking",
      description: "Holistic approach connecting economic flows, geopolitical dynamics, and technological trends"
    },
    {
      icon: TrendingUp, 
      title: "Corridor Economics Expertise",
      description: "Proprietary frameworks for optimizing capital, technology, and expertise flows across regions"
    },
    {
      icon: Users,
      title: "Board-Level Experience", 
      description: "Executive advisory experience with institutional investors and global enterprises"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Why Choose Polrydian
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              We bring a unique systems thinking approach that combines corridor economics expertise 
              with board-level experience across sovereign funds, infrastructure operators, and deep tech 
              innovators. Our methodology transforms complex global challenges into strategic opportunities 
              through proprietary frameworks and cross-border execution capabilities.
            </p>
          </div>
        </div>

        {/* Differentiators */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {differentiators.map((diff, index) => (
            <Card key={index} className="text-center border-border/50 hover:border-accent/30 transition-all duration-300">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-accent/10 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <diff.icon className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{diff.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{diff.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Accomplishments */}
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-8 border border-border/50">
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
            Proven Track Record
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {accomplishments.map((accomplishment, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground leading-relaxed">{accomplishment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};