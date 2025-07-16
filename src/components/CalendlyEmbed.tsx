import { useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface CalendlyEmbedProps {
  calendlyUrl: string
  height?: string
  title?: string
  description?: string
  prefill?: {
    name?: string
    email?: string
    customAnswers?: Record<string, string>
  }
}

export default function CalendlyEmbed({
  calendlyUrl,
  height = "700px",
  title = "Schedule Your Meeting",
  description = "Choose a time that works best for you",
  prefill = {}
}: CalendlyEmbedProps) {
  const calendlyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    
    script.onload = () => {
      if ((window as any).Calendly && calendlyRef.current) {
        (window as any).Calendly.initInlineWidget({
          url: calendlyUrl,
          parentElement: calendlyRef.current,
          prefill: prefill,
          utm: {
            utmCampaign: 'Website Embed',
            utmSource: window.location.hostname,
            utmMedium: 'inline'
          }
        })
      }
    }
    
    document.head.appendChild(script)

    // Load Calendly CSS
    const link = document.createElement('link')
    link.href = 'https://assets.calendly.com/assets/external/widget.css'
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]')
      const existingLink = document.querySelector('link[href="https://assets.calendly.com/assets/external/widget.css"]')
      
      if (existingScript) document.head.removeChild(existingScript)
      if (existingLink) document.head.removeChild(existingLink)
    }
  }, [calendlyUrl, prefill])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          ref={calendlyRef}
          style={{ 
            minWidth: '320px', 
            height: height,
            position: 'relative'
          }}
          className="calendly-inline-widget"
          data-url={calendlyUrl}
        />
      </CardContent>
    </Card>
  )
}