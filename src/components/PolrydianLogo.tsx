import { cn } from "@/lib/utils";
import logoFull from "@/assets/polrydian-logo-full.png";
import logoMini from "@/assets/polrydian-logo-mini.png";

interface PolrydianLogoProps {
  variant?: "full" | "mini" | "text";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const PolrydianLogo = ({ 
  variant = "full", 
  size = "md", 
  className 
}: PolrydianLogoProps) => {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-20"
  };

  if (variant === "text") {
    return (
      <div className={cn("flex flex-col items-center", className)}>
        <h1 className={cn(
          "font-bold text-primary",
          size === "sm" && "text-lg",
          size === "md" && "text-2xl",
          size === "lg" && "text-4xl"
        )}>
          POLRYDIAN GROUP
        </h1>
        <p className={cn(
          "text-secondary font-medium tracking-wide",
          size === "sm" && "text-xs",
          size === "md" && "text-sm",
          size === "lg" && "text-lg"
        )}>
          STRATEGY | INNOVATION | PARTNERSHIP
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center", className)}>
      <img 
        src={variant === "mini" ? logoMini : logoFull}
        alt="Polrydian Group - Strategy, Innovation, Partnership"
        className={cn("w-auto object-contain", sizeClasses[size])}
      />
    </div>
  );
};