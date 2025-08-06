import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/LoadingSpinner";

import { ConsultationBookingForm } from "@/components/ConsultationBookingForm";
import { supabase } from "@/integrations/supabase/client";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Linkedin, 
  Send,
  Clock,
  Shield,
  CheckCircle
} from "lucide-react";

export const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    service: "",
    message: "",
    urgent: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);

    try {
      // Enhanced validation using the security schema
      const { contactFormSchema, sanitizeFormData } = await import("@/lib/security")
      
      // Sanitize input data
      const sanitizedData = sanitizeFormData(formData)
      
      // Validate the sanitized data
      const validationResult = contactFormSchema.safeParse(sanitizedData)
      
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => err.message).join(', ')
        toast({
          title: "Validation Error",
          description: errors,
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      const validData = validationResult.data

      // For now, just submit to consultation bookings table directly
      const consultationData = {
        first_name: validData.firstName,
        last_name: validData.lastName,
        email: validData.email,
        company: validData.company,
        message: validData.message,
        urgency_level: validData.urgent ? 'urgent' : 'standard',
        service_area: validData.service || 'General Inquiry'
      };

      const { data, error } = await supabase
        .from('consultation_bookings')
        .insert([consultationData]);

      if (error) throw error;

      toast({
        title: "Message Sent Successfully!",
        description: "Your strategic consultation inquiry has been received. You'll get a confirmation email shortly.",
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        service: "",
        message: "",
        urgent: false
      });

    } catch (error: any) {
      console.error('Contact form error:', error);
      
      // Provide specific error messages for security issues
      if (error.message?.includes('validation')) {
        toast({
          title: "Invalid Input",
          description: "Please check your input and try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error Sending Message",
          description: "There was an issue sending your message. Please try again or contact us directly.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
      value: "+1 305 878 6400",
      description: "Direct line for urgent matters"
    },
    {
      icon: MapPin,
      title: "Headquarters",
      value: "Miami, Florida",
      description: "Global operations base"
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

          {/* Consultation Booking Form */}
          <div>
            <ConsultationBookingForm />
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
                <a 
                  href="#consultation-form"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-lg font-medium transition-colors"
                >
                  Schedule Strategic Consultation
                </a>
                <Button variant="outline" size="lg" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                  <Linkedin className="h-5 w-5 mr-2" />
                  <a href="https://www.linkedin.com/in/patrick-misiewicz-mslscm-28299b40" target="_blank" rel="noopener noreferrer">
                    Connect on LinkedIn
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};