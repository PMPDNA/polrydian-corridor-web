import CalendlyEmbed from '@/components/CalendlyEmbed';
import { Navigation } from '@/components/Navigation';
import { EnhancedSEO } from '@/components/EnhancedSEO';

export default function Schedule() {
  return (
    <div className="min-h-screen bg-background">
      <EnhancedSEO 
        title="Schedule Consultation | Strategic Advisory Services"
        description="Schedule a strategic consultation with Patrick Misiewicz. Expert guidance on corridor economics, geopolitical strategy, and market intelligence."
        keywords={["consultation", "strategic advisory", "corridor economics", "expert guidance"]}
      />
      <Navigation />
      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Schedule a Consultation</h1>
            <p className="text-lg text-muted-foreground">
              Book a strategic consultation to discuss your unique challenges and opportunities.
            </p>
          </div>
          <CalendlyEmbed 
            calendlyUrl="https://calendly.com/patrick-misiewicz/strategic-consulting-intro-call"
            height="700px"
            title="Strategic Consultation Booking"
            description="Select your preferred time for a comprehensive strategic discussion"
          />
        </div>
      </main>
    </div>
  );
}