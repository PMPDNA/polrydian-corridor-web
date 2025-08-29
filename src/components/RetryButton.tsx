import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface RetryButtonProps {
  onRetry: () => void;
  disabled?: boolean;
  delay?: number;
  children?: React.ReactNode;
}

export const RetryButton = ({ 
  onRetry, 
  disabled = false, 
  delay = 1000,
  children = "Retry"
}: RetryButtonProps) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    
    // Add delay to prevent rapid retries that could cause loops
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Button 
      onClick={handleRetry}
      disabled={disabled || isRetrying}
      variant="outline"
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
      {isRetrying ? 'Retrying...' : children}
    </Button>
  );
};