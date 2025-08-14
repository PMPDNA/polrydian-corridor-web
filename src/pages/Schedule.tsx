import { useEffect } from 'react';
import CalendlyEmbed from '@/components/CalendlyEmbed';
import { Navigation } from '@/components/Navigation';
import { EnhancedSEO } from '@/components/EnhancedSEO';

export default function Schedule() {
  // Track Calendly conversions in GA4
  useEffect(() => {
    function onCalendlyEvent(e: MessageEvent) {
      const fromCalendly = typeof e.data === "object" && e.data?.event?.startsWith?.("calendly.");
      if (!fromCalendly) return;
      if (e.data.event === "calendly.event_scheduled") {
        const meta = {
          method: "calendly",
          event_uri: e.data?.payload?.event?.uri || "",
          invitee_uri: e.data?.payload?.invitee?.uri || ""
        };
        // GA4 via gtag
        // @ts-ignore
        window.gtag?.("event", "generate_lead", meta);
        // Or GTM
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({ event: "generate_lead", ...meta });
      }
    }
    window.addEventListener("message", onCalendlyEvent);
    return () => window.removeEventListener("message", onCalendlyEvent);
  }, []);

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