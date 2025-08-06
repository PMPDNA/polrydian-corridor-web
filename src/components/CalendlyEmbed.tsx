import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Calendly: any;
  }
}

interface CalendlyEmbedProps {
  calendlyUrl: string;
  height?: string;
  title?: string;
  description?: string;
}

export default function CalendlyEmbed({ 
  calendlyUrl, 
  height = "600px", 
  title = "Schedule a Meeting",
  description = "Select your preferred time"
}: CalendlyEmbedProps) {
  const calendlyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clear any existing widget
    if (calendlyRef.current) {
      calendlyRef.current.innerHTML = '';
    }

    // Load Calendly script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;

    script.onload = () => {
      if (window.Calendly && calendlyRef.current) {
        window.Calendly.initInlineWidget({
          url: calendlyUrl,
          parentElement: calendlyRef.current,
          prefill: {},
          utm: {}
        });
      }
    };

    script.onerror = () => {
      // Fallback to direct link if script fails to load
      if (calendlyRef.current) {
        calendlyRef.current.innerHTML = `
          <div class="flex items-center justify-center h-full border border-dashed border-border rounded-lg">
            <div class="text-center">
              <p class="text-muted-foreground mb-4">Calendly widget failed to load</p>
              <a href="${calendlyUrl}" target="_blank" rel="noopener noreferrer" 
                 class="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                Open Calendly in New Tab
              </a>
            </div>
          </div>
        `;
      }
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [calendlyUrl]);

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div 
        ref={calendlyRef}
        className="calendly-inline-widget w-full" 
        style={{ 
          minWidth: '320px', 
          height: height,
          border: '1px solid hsl(var(--border))',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      />
    </div>
  );
}