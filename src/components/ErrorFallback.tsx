import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { RetryButton } from './RetryButton';
import { safeEnv } from '@/lib/safe-utils';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  description?: string;
}

export const ErrorFallback = ({ 
  error, 
  resetError,
  title = "Something went wrong",
  description = "We're sorry, but something unexpected happened. Please try refreshing the page."
}: ErrorFallbackProps) => {
  const handleRefresh = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="text-left">
            {description}
          </CardDescription>
          
          {error && safeEnv.isDev() && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm font-medium mb-2">
                Error Details (Development Only)
              </summary>
              <code className="text-xs bg-muted p-2 rounded block overflow-auto">
                {error.message}
              </code>
            </details>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <RetryButton onRetry={handleRefresh} />
            <Button onClick={handleRefresh} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};