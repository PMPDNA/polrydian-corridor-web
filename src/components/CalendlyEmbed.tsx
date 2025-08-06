import { useEffect, useRef } from 'react'

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
    // Clean up any existing Calendly widgets
    if (calendlyRef.current) {
      calendlyRef.current.innerHTML = ''
    }

    // Load Calendly CSS first
    let link = document.querySelector('link[href*="calendly"]') as HTMLLinkElement
    if (!link) {
      link = document.createElement('link')
      link.href = 'https://assets.calendly.com/assets/external/widget.css'
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }

    // Load Calendly widget script
    let script = document.querySelector('script[src*="calendly"]') as HTMLScriptElement
    const initWidget = () => {
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

    if (!script) {
      script = document.createElement('script')
      script.src = 'https://assets.calendly.com/assets/external/widget.js'
      script.async = true
      script.onload = initWidget
      document.head.appendChild(script)
    } else {
      // Script already exists, just initialize
      if ((window as any).Calendly) {
        initWidget()
      } else {
        script.addEventListener('load', initWidget)
      }
    }
  }, [calendlyUrl, prefill])

  return (
    <div className="w-full">
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
    </div>
  )
}