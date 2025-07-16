import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Quote, Building, MapPin } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  rating: number;
  content: string;
  tags: string[];
  date: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Chief Strategy Officer',
    company: 'Global Tech Solutions',
    location: 'Singapore',
    rating: 5,
    content: "Patrick's corridor economics approach transformed our Asia-Pacific expansion strategy. His deep understanding of regional complexities and practical solutions helped us navigate challenges we didn't even know existed.",
    tags: ['Strategic Planning', 'Asia-Pacific', 'Expansion'],
    date: '2024-06-15'
  },
  {
    id: '2',
    name: 'Dr. Maria Rodriguez',
    role: 'Director of International Development',
    company: 'AgriTech Innovations',
    location: 'Mexico City',
    rating: 5,
    content: "Working with Patrick on our food security project was exceptional. His ability to connect smallholder farmers with global supply chains while maintaining sustainability standards exceeded our expectations.",
    tags: ['Food Security', 'Supply Chain', 'Sustainability'],
    date: '2024-05-22'
  },
  {
    id: '3',
    name: 'James Morrison',
    role: 'Managing Director',
    company: 'European Infrastructure Fund',
    location: 'London',
    rating: 5,
    content: "Patrick's geopolitical insights and strategic thinking were invaluable during our infrastructure investment decisions across Eastern Europe. His Stoic approach kept us focused on what truly mattered.",
    tags: ['Infrastructure', 'Investment', 'Eastern Europe'],
    date: '2024-04-18'
  },
  {
    id: '4',
    name: 'Kwame Asante',
    role: 'CEO',
    company: 'African Logistics Network',
    location: 'Accra',
    rating: 5,
    content: "The corridor mapping strategy Patrick developed for our logistics network increased our operational efficiency by 40%. His understanding of African markets and regulatory environments is unmatched.",
    tags: ['Logistics', 'Africa', 'Operational Efficiency'],
    date: '2024-03-30'
  }
];

export const TestimonialsSection = () => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Client Success Stories
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Hear from leaders who have transformed their strategic challenges into 
            competitive advantages through corridor economics
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="shadow-elegant hover:shadow-glow transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-accent/10 rounded-full">
                    <Quote className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>

                <blockquote className="text-muted-foreground leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </blockquote>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {testimonial.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Building className="h-3 w-3 text-accent" />
                          <span className="text-sm text-muted-foreground">{testimonial.company}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="h-3 w-3 text-accent" />
                          <span className="text-sm text-muted-foreground">{testimonial.location}</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(testimonial.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="shadow-elegant bg-gradient-to-r from-primary/5 to-accent/5 border-accent/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                Join Our Success Stories
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Ready to transform your strategic challenges? Let's create your success story together.
              </p>
              <a href="/calendly-demo">
                <button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-8 py-3 rounded-lg font-medium transition-all duration-300">
                  Start Your Journey
                </button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};