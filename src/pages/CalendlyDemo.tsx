import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import CalendlyButton from '@/components/CalendlyButton'
import CalendlyPopup from '@/components/CalendlyPopup'
import CalendlyEmbed from '@/components/CalendlyEmbed'

export default function CalendlyDemo() {
  // Your actual Calendly URL
  const calendlyUrl = "https://calendly.com/patrick-misiewicz/strategic-consulting-intro-call"
  
  const prefillData = {
    name: "John Doe",
    email: "john@example.com"
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Schedule a Meeting</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the booking method that works best for you. We offer multiple ways to schedule your consultation.
          </p>
        </div>

        {/* Call to Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Booking Options</CardTitle>
            <CardDescription>
              Click any button below to start scheduling your meeting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              {/* Simple Link Button */}
              <CalendlyButton 
                calendlyUrl={calendlyUrl}
                buttonText="Open in New Tab"
                variant="outline"
              />
              
              {/* Popup Widget Button */}
              <CalendlyPopup 
                calendlyUrl={calendlyUrl}
                buttonText="Quick Popup"
                variant="default"
                prefill={prefillData}
              />
              
              {/* Different variants */}
              <CalendlyPopup 
                calendlyUrl={calendlyUrl}
                buttonText="Book Strategy Call"
                variant="default"
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              />
            </div>
            
            <Separator />
            
            {/* Hero CTA Section */}
            <div className="text-center space-y-4 py-8">
              <h2 className="text-2xl font-semibold">Ready to Get Started?</h2>
              <p className="text-muted-foreground">
                Book a free 30-minute consultation to discuss your project
              </p>
              <CalendlyPopup 
                calendlyUrl={calendlyUrl}
                buttonText="Schedule Free Consultation"
                variant="default"
                size="lg"
                prefill={prefillData}
              />
            </div>
          </CardContent>
        </Card>

        {/* Embedded Calendar */}
        <CalendlyEmbed 
          calendlyUrl={calendlyUrl}
          title="Schedule Your Meeting"
          description="Pick a time that works best for you from the calendar below"
          height="600px"
          prefill={prefillData}
        />

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Set This Up</CardTitle>
            <CardDescription>
              Steps to integrate Calendly with your own booking link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h3 className="font-semibold">1. Get Your Calendly URL</h3>
                <p className="text-sm text-muted-foreground">
                  Sign up for Calendly and copy your booking page URL (e.g., calendly.com/yourname/30min)
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">2. Choose Integration Type</h3>
                <p className="text-sm text-muted-foreground">
                  Use CalendlyButton for simple links, CalendlyPopup for overlays, or CalendlyEmbed for inline calendars
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">3. Customize & Deploy</h3>
                <p className="text-sm text-muted-foreground">
                  Customize the button text, styling, and prefill data to match your brand and workflow
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}