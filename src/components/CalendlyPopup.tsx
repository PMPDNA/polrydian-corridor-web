import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'

interface CalendlyPopupProps {
  calendlyUrl: string
  buttonText?: string
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  prefill?: {
    name?: string
    email?: string
    customAnswers?: Record<string, string>
  }
}

export default function CalendlyPopup({
  calendlyUrl,
  buttonText = "Book a Meeting",
  variant = "default",
  size = "default", 
  className = "",
  prefill = {}
}: CalendlyPopupProps) {
  
  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.head.appendChild(script)

    return () => {
      // Cleanup script if component unmounts
      const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]')
      if (existingScript) {
        document.head.removeChild(existingScript)
      }
    }
  }, [])

  const openCalendly = () => {
    try {
      if ((window as any).Calendly && (window as any).Calendly.initPopupWidget) {
        (window as any).Calendly.initPopupWidget({
          url: calendlyUrl,
          prefill: prefill,
          utm: {
            utmCampaign: 'Website CTA',
            utmSource: window.location.hostname,
            utmMedium: 'popup'
          }
        });
        
        // Track successful popup open
        (window as any).gtag?.('event', 'calendly_popup_open', {
          event_category: 'engagement',
          event_label: 'calendly_widget',
          value: 1
        });
      } else {
        // Fallback to opening in new tab
        console.warn('Calendly widget not loaded, opening in new tab');
        window.open(calendlyUrl, '_blank');
        
        // Track fallback usage
        (window as any).gtag?.('event', 'calendly_fallback', {
          event_category: 'engagement',
          event_label: 'external_link',
          value: 1
        });
      }
    } catch (error) {
      console.error('Error opening Calendly widget:', error);
      // Always fallback to external link if there's an error
      window.open(calendlyUrl, '_blank');
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={`gap-2 ${className}`}
        onClick={openCalendly}
      >
        <Calendar className="h-4 w-4" />
        {buttonText}
      </Button>
      
      {/* Calendly CSS */}
      <link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet" />
    </>
  )
}