import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import CalendlyPopup from "@/components/CalendlyPopup";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Linkedin, 
  Send,
  Clock,
  Shield
} from "lucide-react";

export const Contact = () => {
  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "info@polrydian.com",
      description: "Strategic consultation inquiries"
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+1 (305) 555-0123",
      description: "Direct line for urgent matters"
    },
    {
      icon: MapPin,
      title: "Headquarters",
      value: "Miami, Florida",
      description: "Global operations base"
    },
    {
      icon: Globe,
      title: "Global Reach",
      value: "60+ Countries",
      description: "Worldwide strategic presence"
    }
  ];

  const services = [
    "Strategic Consultation",
    "Corridor Economics Advisory",
    "Infrastructure & M&A",
    "Geopolitical Risk Assessment",
    "Supply Chain Optimization",
    "Market Entry Strategy",
    "Other (Please specify)"
  ];

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Get in Touch
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Let's clearly define your strategic challenges and craft the corridor that 
            decisively moves your ambitions forward.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">Strategic Consultation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  Ready to transform complexity into strategic opportunity? Reach out to discuss 
                  how corridor economics can unlock new pathways for your organization.
                </p>
                
                <div className="grid gap-4">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <info.icon className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{info.title}</h4>
                        <p className="text-foreground font-medium">{info.value}</p>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional Info */}
                <div className="border-t border-border pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="h-5 w-5 text-accent" />
                    <span className="font-semibold text-foreground">Response Time</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Strategic consultation requests receive priority attention. 
                    Expect a response within 24 hours for urgent matters, 48 hours for standard inquiries.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-accent" />
                  <span className="text-sm text-muted-foreground">
                    All communications are confidential and protected under professional advisory privilege.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">Start the Conversation</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" placeholder="Your first name" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" placeholder="Your last name" className="mt-1" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" type="email" placeholder="your.email@company.com" className="mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="company">Organization</Label>
                    <Input id="company" placeholder="Your company or organization" className="mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="service">Area of Interest</Label>
                    <select 
                      id="service" 
                      className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select a service area</option>
                      {services.map((service, index) => (
                        <option key={index} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="message">Strategic Challenge or Opportunity *</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Describe your strategic challenge, project scope, or opportunity. The more detail you provide, the better we can tailor our initial consultation." 
                      className="mt-1 min-h-[120px]"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="urgent" className="rounded" />
                    <Label htmlFor="urgent" className="text-sm">
                      This is an urgent strategic matter requiring immediate attention
                    </Label>
                  </div>

                  <Button variant="hero" size="lg" className="w-full text-lg py-6">
                    <Send className="h-5 w-5 mr-2" />
                    Send Strategic Inquiry
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By submitting this form, you agree to our confidentiality protocols and 
                    professional consultation terms.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action Banner */}
        <div className="mt-16">
          <Card className="shadow-elegant bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-accent/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                "What stands in the way becomes the way."
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Transform your strategic obstacles into competitive advantages. 
                Let's navigate complexity together and build the corridors that advance your mission.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <CalendlyPopup
                  calendlyUrl="https://calendly.com/your-username/30min"
                  buttonText="Schedule Consultation Call"
                  variant="default"
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                />
                <Button variant="outline" size="lg" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                  <Linkedin className="h-5 w-5 mr-2" />
                  Connect on LinkedIn
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};