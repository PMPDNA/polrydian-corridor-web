import { useEffect } from 'react';
import { InlineWidget } from 'react-calendly';

interface CalendlyInlineWidgetProps {
  url: string;
  height?: number;
  prefill?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
  };
  utm?: {
    utmCampaign?: string;
    utmSource?: string;
    utmMedium?: string;
    utmContent?: string;
    utmTerm?: string;
  };
}

export function CalendlyInlineWidget({ 
  url, 
  height = 650,
  prefill,
  utm 
}: CalendlyInlineWidgetProps) {
  useEffect(() => {
    // Load Calendly CSS
    const link = document.createElement('link');
    link.href = 'https://assets.calendly.com/assets/external/widget.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      // Cleanup
      const existingLink = document.querySelector('link[href*="calendly"]');
      if (existingLink) {
        existingLink.remove();
      }
    };
  }, []);

  return (
    <div className="calendly-widget-container">
      <InlineWidget
        url={url}
        styles={{
          height: `${height}px`,
          width: '100%',
        }}
        prefill={prefill}
        utm={utm}
      />
    </div>
  );
}