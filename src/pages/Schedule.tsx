import { Navigation } from "@/components/Navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CalendlyEmbed from "@/components/CalendlyEmbed";
import { ConsultationBookingForm } from "@/components/ConsultationBookingForm";
import { Calendar, Users, Clock, CheckCircle } from "lucide-react";
import Footer from "@/components/Footer";

export default function Schedule() {
  const benefits = [
    "Strategic pathway identification",
    "Corridor economics application",
    "Geopolitical risk assessment",
    "Implementation roadmap development"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <Breadcrumbs />
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Schedule Strategic Consultation
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transform your strategic challenges into competitive advantages through corridor economics.
            Choose your preferred method to schedule our discussion.
          </p>
        </div>

        {/* Benefits */}
        <Card className="mb-12 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-accent" />
              What to Expect from Your Strategic Consultation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-accent" />
                <span className="font-medium text-foreground">Duration: 45-60 minutes</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Focused discussion on your strategic challenges with actionable next steps and corridor economics framework application.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Calendly Embed */}
          <div>
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-accent" />
                  Direct Scheduling
                </CardTitle>
                <p className="text-muted-foreground">
                  Select your preferred time directly from available slots
                </p>
              </CardHeader>
              <CardContent>
                <CalendlyEmbed
                  calendlyUrl="https://calendly.com/patrick-misiewicz/strategic-consulting-intro-call"
                  height="600px"
                  title="Strategic Consultation"
                  description="Choose your preferred time slot"
                />
              </CardContent>
            </Card>
          </div>

          {/* Custom Booking Form */}
          <div>
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Alternative Booking Method</CardTitle>
                <p className="text-muted-foreground">
                  Prefer to describe your needs first? Use our consultation request form
                </p>
              </CardHeader>
              <CardContent>
                <ConsultationBookingForm />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12 text-center">
          <Card className="shadow-elegant bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-accent/20">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                "What stands in the way becomes the way."
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Every strategic challenge contains hidden pathways to success. Let's identify and build 
                the corridors that will advance your mission decisively.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}