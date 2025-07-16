import { Navigation } from "@/components/Navigation";
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
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Schedule a Meeting</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pick a time that works best for you from the calendar below
          </p>
        </div>

        {/* Embedded Calendar */}
        <CalendlyEmbed 
          calendlyUrl={calendlyUrl}
          title="Schedule Your Meeting"
          description="Choose your preferred time slot for a strategic consultation"
          height="700px"
          prefill={prefillData}
        />
      </div>
    </div>
  )
}