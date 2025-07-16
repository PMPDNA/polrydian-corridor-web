import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { AlertCircle, CheckCircle, Info, Clock } from "lucide-react";

interface NotificationProps {
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

export const Toast = ({ type, title, message, duration = 5000, onClose }: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertCircle
  };

  const colors = {
    success: "text-green-600 bg-green-50 border-green-200",
    error: "text-red-600 bg-red-50 border-red-200", 
    info: "text-blue-600 bg-blue-50 border-blue-200",
    warning: "text-yellow-600 bg-yellow-50 border-yellow-200"
  };

  const Icon = icons[type];

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}>
      <Card className={`min-w-80 max-w-md shadow-elegant ${colors[type]}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Icon className="h-5 w-5 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">{title}</h4>
              <p className="text-sm opacity-90">{message}</p>
            </div>
            {onClose && (
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => onClose(), 300);
                }}
                className="text-current opacity-50 hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const SkeletonLoader = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-muted rounded ${className}`} />
);

export const ProgressiveImage = ({ 
  src, 
  alt, 
  className = "",
  placeholder = "/placeholder.svg"
}: {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded">
          <LoadingSpinner size="sm" />
        </div>
      )}
      <img
        src={hasError ? placeholder : src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
};