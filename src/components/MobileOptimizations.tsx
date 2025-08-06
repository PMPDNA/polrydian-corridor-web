import React, { useEffect, useState, useCallback } from 'react';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { useOfflineSupport } from '@/hooks/useOfflineSupport';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Battery, 
  Download,
  Pause,
  Play
} from 'lucide-react';

interface NetworkInfo {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

interface BatteryInfo {
  level: number;
  charging: boolean;
  dischargingTime: number;
  chargingTime: number;
}

export const MobileOptimizations: React.FC = () => {
  const realtimeStatus = useRealtimeUpdates('articles');
  const { isOnline, clearQueue } = useOfflineSupport();
  
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({});
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [dataSaverMode, setDataSaverMode] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTouchDevice = 'ontouchstart' in window;
      const isSmallScreen = window.innerWidth <= 768;
      
      setIsMobile(isMobileDevice || (isTouchDevice && isSmallScreen));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get network information
  useEffect(() => {
    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;
      
      if (connection) {
        setNetworkInfo({
          type: connection.type,
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        });
        
        setDataSaverMode(connection.saveData || false);
      }
    };

    updateNetworkInfo();
    
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
      return () => connection.removeEventListener('change', updateNetworkInfo);
    }
  }, []);

  // Get battery information
  useEffect(() => {
    const updateBatteryInfo = async () => {
      try {
        if ('getBattery' in navigator) {
          const battery = await (navigator as any).getBattery();
          
          const updateBattery = () => {
            setBatteryInfo({
              level: battery.level,
              charging: battery.charging,
              dischargingTime: battery.dischargingTime,
              chargingTime: battery.chargingTime
            });
          };

          updateBattery();
          
          battery.addEventListener('chargingchange', updateBattery);
          battery.addEventListener('levelchange', updateBattery);
          
          return () => {
            battery.removeEventListener('chargingchange', updateBattery);
            battery.removeEventListener('levelchange', updateBattery);
          };
        }
      } catch (error) {
        console.log('Battery API not available');
      }
    };

    updateBatteryInfo();
  }, []);

  // Auto-enable optimizations for low battery or slow connection
  useEffect(() => {
    if (batteryInfo && batteryInfo.level < 0.2 && !batteryInfo.charging) {
      // Enable battery saver mode
      if (!isPaused) {
        pauseUpdates();
      }
    }

    if (networkInfo.effectiveType === 'slow-2g' || networkInfo.saveData) {
      // Enable data saver mode
      if (!isPaused) {
        pauseUpdates();
      }
    }
  }, [batteryInfo, networkInfo, isPaused, pauseUpdates]);

  const handleToggleUpdates = useCallback(() => {
    if (isPaused) {
      resumeUpdates();
    } else {
      pauseUpdates();
    }
  }, [isPaused, pauseUpdates, resumeUpdates]);

  const getConnectionQuality = () => {
    if (!networkInfo.effectiveType) return 'unknown';
    
    switch (networkInfo.effectiveType) {
      case '4g': return 'excellent';
      case '3g': return 'good';
      case '2g': return 'poor';
      case 'slow-2g': return 'very-poor';
      default: return 'unknown';
    }
  };

  const getConnectionColor = () => {
    const quality = getConnectionQuality();
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'poor': return 'text-yellow-600';
      case 'very-poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!isMobile) {
    return null; // Don't show mobile optimizations on desktop
  }

  return (
    <div className="space-y-4">
      {/* Mobile Status Alert */}
      <Alert>
        <Smartphone className="h-4 w-4" />
        <AlertDescription>
          Mobile optimizations are active. Real-time updates and caching are optimized for your device.
        </AlertDescription>
      </Alert>

      {/* Mobile Stats */}
      <div className="grid gap-3 grid-cols-2">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              <div className="space-y-1">
                <div className="text-sm font-medium">Connection</div>
                <div className={`text-xs ${getConnectionColor()}`}>
                  {networkInfo.effectiveType?.toUpperCase() || 'Unknown'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {batteryInfo && (
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Battery className={`h-4 w-4 ${batteryInfo.charging ? 'text-green-600' : batteryInfo.level < 0.2 ? 'text-red-600' : 'text-gray-600'}`} />
                <div className="space-y-1">
                  <div className="text-sm font-medium">Battery</div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round(batteryInfo.level * 100)}%
                    {batteryInfo.charging && ' (Charging)'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Optimization Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Real-time Updates</div>
                <div className="text-sm text-muted-foreground">
                  {isPaused ? 'Paused to save data/battery' : 'Active'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isPaused ? "secondary" : "default"}>
                  {isPaused ? 'Paused' : 'Active'}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleToggleUpdates}
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Offline Cache</div>
                <div className="text-sm text-muted-foreground">
                  {cacheSize ? `${Math.round(cacheSize / 1024)}KB cached` : 'No cached data'}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={clearCache}
                disabled={!cacheSize}
              >
                <Download className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Saver Notifications */}
      {(dataSaverMode || networkInfo.saveData) && (
        <Alert>
          <Download className="h-4 w-4" />
          <AlertDescription>
            Data Saver mode is enabled. Some features may be limited to reduce data usage.
          </AlertDescription>
        </Alert>
      )}

      {batteryInfo && batteryInfo.level < 0.2 && !batteryInfo.charging && (
        <Alert>
          <Battery className="h-4 w-4" />
          <AlertDescription>
            Low battery detected. Real-time features have been optimized to extend battery life.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};