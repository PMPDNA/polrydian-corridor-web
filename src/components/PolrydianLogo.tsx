interface PolrydianLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "full" | "compact";
}

export const PolrydianLogo = ({ className = "", size = "md", variant = "compact" }: PolrydianLogoProps) => {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12", 
    lg: "h-16"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  // Geometric icon that matches your crystalline logo design
  const GeometricIcon = () => (
    <div className={`${sizeClasses[size]} aspect-square relative`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Multi-layered geometric shape inspired by your logo */}
        <defs>
          <linearGradient id="polrydianGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(213, 92%, 45%)" />
            <stop offset="50%" stopColor="hsl(195, 100%, 50%)" />
            <stop offset="100%" stopColor="hsl(213, 92%, 30%)" />
          </linearGradient>
          <linearGradient id="polrydianGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(195, 100%, 60%)" />
            <stop offset="100%" stopColor="hsl(213, 92%, 40%)" />
          </linearGradient>
          <linearGradient id="polrydianGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(213, 92%, 25%)" />
            <stop offset="100%" stopColor="hsl(195, 100%, 45%)" />
          </linearGradient>
        </defs>
        
        {/* Base geometric facets */}
        <polygon 
          points="50,10 85,35 85,65 50,90 15,65 15,35" 
          fill="url(#polrydianGradient1)" 
          className="drop-shadow-sm"
        />
        <polygon 
          points="50,10 85,35 65,25 50,20" 
          fill="url(#polrydianGradient2)" 
          className="drop-shadow-sm"
        />
        <polygon 
          points="50,10 15,35 35,25 50,20" 
          fill="url(#polrydianGradient3)" 
          className="drop-shadow-sm"
        />
        <polygon 
          points="15,35 50,50 35,45 15,40" 
          fill="url(#polrydianGradient1)" 
          opacity="0.8"
        />
        <polygon 
          points="85,35 50,50 65,45 85,40" 
          fill="url(#polrydianGradient2)" 
          opacity="0.8"
        />
        <polygon 
          points="50,50 85,65 65,75 50,80" 
          fill="url(#polrydianGradient3)" 
          opacity="0.9"
        />
        <polygon 
          points="50,50 15,65 35,75 50,80" 
          fill="url(#polrydianGradient1)" 
          opacity="0.9"
        />
      </svg>
    </div>
  );

  if (variant === "icon") {
    return (
      <div className={className}>
        <GeometricIcon />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <GeometricIcon />
      {variant === "full" && (
        <div>
          <div className={`font-bold ${textSizeClasses[size]} text-foreground font-polrydian tracking-wide`}>
            POLRYDIAN GROUP
          </div>
          <div className="text-xs text-accent font-polrydian tracking-widest uppercase">
            Strategy | Innovation | Partnership
          </div>
        </div>
      )}
      {variant === "compact" && (
        <div className={`font-bold ${textSizeClasses[size]} text-foreground font-polrydian tracking-wide`}>
          POLRYDIAN GROUP
        </div>
      )}
    </div>
  );
};