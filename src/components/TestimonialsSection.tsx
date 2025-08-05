import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Quote, ArrowRight } from "lucide-react";
import CalendlyPopup from "./CalendlyPopup";

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
  result?: string;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "CEO",
    company: "TechFlow Solutions",
    location: "Singapore",
    rating: 5,
    content: "Patrick's corridor economics approach reduced our market-entry time by 60%. His strategic mapping identified pathways we never considered.",
    tags: ["Market Entry", "Strategic Planning"],
    date: "2024-01",
    result: "60% faster market entry"
  },
  {
    id: "2",
    name: "Marcus Rodriguez",
    role: "Investment Director",
    company: "Global Ventures",
    location: "Miami, FL",
    rating: 5,
    content: "The strategic clarity Patrick provided transformed our $200M infrastructure investment approach across three continents.",
    tags: ["Infrastructure", "Global Investment"],
    date: "2024-02",
    result: "$200M investment optimization"
  },
  {
    id: "3",
    name: "Dr. Amara Okafor",
    role: "Director of Development",
    company: "AfriTech Consortium",
    location: "Lagos, Nigeria",
    rating: 5,
    content: "Patrick's expertise in corridor economics unlocked strategic partnerships that seemed impossible. Exceptional strategic insight.",
    tags: ["Partnership Development", "Corridor Economics"],
    date: "2024-03",
    result: "Strategic partnerships achieved"
  }
];

export const TestimonialsSection = () => {
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Proven Strategic Results
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transforming complex challenges into competitive advantages for global leaders
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="shadow-elegant hover:shadow-glow transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <Quote className="h-8 w-8 text-accent opacity-50" />
                  {renderStars(testimonial.rating)}
                </div>
                
                {testimonial.result && (
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 mb-4">
                    <p className="text-accent font-semibold text-sm">
                      ✨ {testimonial.result}
                    </p>
                  </div>
                )}
                
                <blockquote className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </blockquote>
                
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {testimonial.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="border-t border-accent/10 pt-4">
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </p>
                    <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-br from-accent/5 to-accent/10 rounded-2xl p-8 border border-accent/20">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Ready to Transform Your Strategic Challenges?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join the leaders who've unlocked competitive advantages through corridor economics.
            Schedule your strategic consultation today.
          </p>
          <CalendlyPopup
            calendlyUrl="https://calendly.com/patrickmisiewicz/consultation"
            buttonText="Schedule Your Strategic Consultation"
            variant="default"
            size="lg"
            className="bg-accent text-white px-8 py-4 hover:bg-accent/90"
          />
        </div>
      </div>
    </section>
  );
};