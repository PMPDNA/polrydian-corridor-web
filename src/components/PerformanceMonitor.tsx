import { useEffect, useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface PerformanceAlert {
  type: 'warning' | 'error' | 'info';
  message: string;
}

export const PerformanceMonitor = () => {
  const { performance } = useAnalytics();
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!performance) return;

    const newAlerts: PerformanceAlert[] = [];

    // Check performance thresholds
    if (performance.pageLoadTime > 3000) {
      newAlerts.push({
        type: 'warning',
        message: `Slow page load time: ${Math.round(performance.pageLoadTime)}ms`
      });
    }

    if (performance.firstContentfulPaint > 2500) {
      newAlerts.push({
        type: 'warning',
        message: `Slow first contentful paint: ${Math.round(performance.firstContentfulPaint)}ms`
      });
    }

    if (performance.largestContentfulPaint > 4000) {
      newAlerts.push({
        type: 'error',
        message: `Poor largest contentful paint: ${Math.round(performance.largestContentfulPaint)}ms`
      });
    }

    setAlerts(newAlerts);
    setIsVisible(newAlerts.length > 0);

    // Auto-hide after 10 seconds
    if (newAlerts.length > 0) {
      const timer = setTimeout(() => setIsVisible(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [performance]);

  if (!isVisible || alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2" role="region" aria-label="Performance alerts">
      {alerts.map((alert, index) => (
        <Alert key={index} variant={alert.type === 'error' ? 'destructive' : 'default'}>
          {alert.type === 'error' ? (
            <AlertTriangle className="h-4 w-4" />
          ) : alert.type === 'warning' ? (
            <Clock className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertDescription className="flex items-center justify-between">
            {alert.message}
            <Badge variant={alert.type === 'error' ? 'destructive' : 'secondary'}>
              {alert.type}
            </Badge>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};