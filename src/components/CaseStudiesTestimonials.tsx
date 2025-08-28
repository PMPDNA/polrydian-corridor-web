import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CaseStudiesTestimonials = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Case Studies & Testimonials
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Success stories and client testimonials showcasing our board-level advisory impact
          </p>
        </div>

        {/* Placeholder Content */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="shadow-elegant border-border/50 h-full">
            <CardContent className="p-8 text-center h-full flex flex-col justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent/10 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Client Success Stories
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Detailed case studies highlighting strategic challenges overcome and 
                measurable outcomes achieved for our clients across different sectors.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Case studies coming soon
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-border/50 h-full">
            <CardContent className="p-8 text-center h-full flex flex-col justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent/10 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Client Testimonials
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Testimonials from sovereign funds, port operators, and deep tech companies 
                who have benefited from our strategic guidance and corridor economics expertise.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Testimonials coming soon
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Interested in learning more about our approach and past successes?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/schedule" className="gap-2">
                Book a Strategy Session
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/about" className="gap-2">
                Learn About Our Experience
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};