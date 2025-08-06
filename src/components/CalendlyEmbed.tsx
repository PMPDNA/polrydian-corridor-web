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

    const loadCalendly = async () => {
      try {
        // Load Calendly CSS first
        let link = document.querySelector('link[href*="calendly"]') as HTMLLinkElement
        if (!link) {
          link = document.createElement('link')
          link.href = 'https://assets.calendly.com/assets/external/widget.css'
          link.rel = 'stylesheet'
          document.head.appendChild(link)
        }

        // Wait for CSS to load
        await new Promise(resolve => {
          if (link.onload) {
            resolve(null)
          } else {
            link.onload = () => resolve(null)
          }
        })

        // Load Calendly widget script
        let script = document.querySelector('script[src*="calendly"]') as HTMLScriptElement
        
        const initWidget = () => {
          if ((window as any).Calendly && calendlyRef.current) {
            try {
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
            } catch (error) {
              console.error('Calendly widget initialization failed:', error)
              // Fallback: show direct link
              if (calendlyRef.current) {
                calendlyRef.current.innerHTML = `
                  <div class="flex items-center justify-center h-full">
                    <a href="${calendlyUrl}" target="_blank" class="text-accent hover:underline">
                      Click here to schedule your meeting
                    </a>
                  </div>
                `
              }
            }
          }
        }

        if (!script) {
          script = document.createElement('script')
          script.src = 'https://assets.calendly.com/assets/external/widget.js'
          script.async = true
          script.onload = initWidget
          script.onerror = () => {
            console.error('Failed to load Calendly script')
            // Fallback: show direct link
            if (calendlyRef.current) {
              calendlyRef.current.innerHTML = `
                <div class="flex items-center justify-center h-full">
                  <a href="${calendlyUrl}" target="_blank" class="text-accent hover:underline">
                    Click here to schedule your meeting
                  </a>
                </div>
              `
            }
          }
          document.head.appendChild(script)
        } else {
          // Script already exists, just initialize
          if ((window as any).Calendly) {
            initWidget()
          } else {
            script.addEventListener('load', initWidget)
          }
        }
      } catch (error) {
        console.error('Calendly setup failed:', error)
        // Fallback: show direct link
        if (calendlyRef.current) {
          calendlyRef.current.innerHTML = `
            <div class="flex items-center justify-center h-full">
              <a href="${calendlyUrl}" target="_blank" class="text-accent hover:underline">
                Click here to schedule your meeting
              </a>
            </div>
          `
        }
      }
    }

    loadCalendly()
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