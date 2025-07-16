import { Button } from '@/components/ui/button'
import { Calendar, ExternalLink } from 'lucide-react'

interface CalendlyButtonProps {
  calendlyUrl: string
  buttonText?: string
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export default function CalendlyButton({ 
  calendlyUrl, 
  buttonText = "Schedule a Call",
  variant = "default",
  size = "default",
  className = ""
}: CalendlyButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={`gap-2 ${className}`}
      onClick={() => window.open(calendlyUrl, '_blank')}
    >
      <Calendar className="h-4 w-4" />
      {buttonText}
      <ExternalLink className="h-3 w-3" />
    </Button>
  )
}