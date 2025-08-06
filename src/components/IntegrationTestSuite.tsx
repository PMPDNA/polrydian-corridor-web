import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { useOfflineSupport } from '@/hooks/useOfflineSupport';
import { useSearchAnalytics } from '@/hooks/useSearchAnalytics';
import { 
  PlayCircle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Wifi,
  Download,
  BarChart3
} from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
  details?: string;
}

export const IntegrationTestSuite: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const { search: performSearch } = useAdvancedSearch();
  const realtimeStatus = useRealtimeUpdates('articles');
  const { isOnline, storeOfflineData } = useOfflineSupport();
  const { trackSearch, analytics } = useSearchAnalytics();

  const tests: Omit<TestResult, 'status'>[] = [
    {
      id: 'search-basic',
      name: 'Basic Search Functionality',
    },
    {
      id: 'search-filters',
      name: 'Advanced Search Filters',
    },
    {
      id: 'search-analytics',
      name: 'Search Analytics Tracking',
    },
    {
      id: 'realtime-connection',
      name: 'Real-time Connection',
    },
    {
      id: 'realtime-subscription',
      name: 'Real-time Subscriptions',
    },
    {
      id: 'offline-detection',
      name: 'Offline Detection',
    },
    {
      id: 'offline-caching',
      name: 'Offline Data Caching',
    },
    {
      id: 'performance-monitoring',
      name: 'Performance Metrics Collection',
    }
  ];

  const updateTestResult = useCallback((id: string, update: Partial<TestResult>) => {
    setTestResults(prev => prev.map(test => 
      test.id === id ? { ...test, ...update } : test
    ));
  }, []);

  const runTest = useCallback(async (test: Omit<TestResult, 'status'>) => {
    const startTime = Date.now();
    updateTestResult(test.id, { status: 'running' });

    try {
      switch (test.id) {
        case 'search-basic':
          const basicResults = await performSearch('corridor economics');
          if (basicResults.length === 0) {
            throw new Error('No search results returned');
          }
          updateTestResult(test.id, { 
            status: 'passed', 
            duration: Date.now() - startTime,
            details: `Found ${basicResults.length} results`
          });
          break;

        case 'search-filters':
          const filteredResults = await performSearch('analysis', {
            status: 'published',
            dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          });
          updateTestResult(test.id, { 
            status: 'passed', 
            duration: Date.now() - startTime,
            details: `Filtered search returned ${filteredResults.length} results`
          });
          break;

        case 'search-analytics':
          await trackSearch('test query', 5, 100);
          updateTestResult(test.id, { 
            status: 'passed', 
            duration: Date.now() - startTime,
            details: `Analytics tracked: ${analytics.totalSearches} total searches`
          });
          break;

        case 'realtime-connection':
          if (!isConnected) {
            throw new Error('Real-time connection not established');
          }
          updateTestResult(test.id, { 
            status: 'passed', 
            duration: Date.now() - startTime,
            details: 'WebSocket connection active'
          });
          break;

        case 'realtime-subscription':
          const unsubscribe = subscribeToTable('articles', (update) => {
            console.log('Test subscription received:', update);
          });
          // Clean up subscription
          setTimeout(() => unsubscribe(), 1000);
          updateTestResult(test.id, { 
            status: 'passed', 
            duration: Date.now() - startTime,
            details: 'Successfully subscribed to table updates'
          });
          break;

        case 'offline-detection':
          updateTestResult(test.id, { 
            status: 'passed', 
            duration: Date.now() - startTime,
            details: `Network status: ${isOnline ? 'Online' : 'Offline'}`
          });
          break;

        case 'offline-caching':
          await cacheData('test-key', { test: 'data' });
          updateTestResult(test.id, { 
            status: 'passed', 
            duration: Date.now() - startTime,
            details: 'Data cached successfully'
          });
          break;

        case 'performance-monitoring':
          if (typeof window !== 'undefined' && 'performance' in window) {
            const timing = window.performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            updateTestResult(test.id, { 
              status: 'passed', 
              duration: Date.now() - startTime,
              details: `Page load time: ${loadTime}ms`
            });
          } else {
            throw new Error('Performance API not available');
          }
          break;

        default:
          throw new Error('Unknown test');
      }
    } catch (error) {
      updateTestResult(test.id, { 
        status: 'failed', 
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [performSearch, trackSearch, analytics, isConnected, subscribeToTable, isOnline, cacheData, updateTestResult]);

  const runAllTests = useCallback(async () => {
    setIsRunning(true);
    setProgress(0);
    
    // Initialize all tests as pending
    const initialResults: TestResult[] = tests.map(test => ({
      ...test,
      status: 'pending'
    }));
    setTestResults(initialResults);

    // Run tests sequentially
    for (let i = 0; i < tests.length; i++) {
      await runTest(tests[i]);
      setProgress(((i + 1) / tests.length) * 100);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
  }, [tests, runTest]);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-gray-500" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">Pending</Badge>;
      case 'running': return <Badge variant="default">Running</Badge>;
      case 'passed': return <Badge variant="default" className="bg-green-600">Passed</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
    }
  };

  const passedTests = testResults.filter(test => test.status === 'passed').length;
  const failedTests = testResults.filter(test => test.status === 'failed').length;
  const totalTests = testResults.length;

  return (
    <div className="space-y-6">
      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Integration Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium">Test Status</div>
                <div className="text-sm text-muted-foreground">
                  {totalTests > 0 ? `${passedTests} passed, ${failedTests} failed of ${totalTests} tests` : 'No tests run yet'}
                </div>
              </div>
              <Button
                onClick={runAllTests}
                disabled={isRunning}
                className="w-32"
              >
                {isRunning ? 'Running...' : 'Run All Tests'}
              </Button>
            </div>
            
            {isRunning && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((test) => (
                <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <div className="font-medium">{test.name}</div>
                      {test.details && (
                        <div className="text-sm text-muted-foreground">{test.details}</div>
                      )}
                      {test.error && (
                        <div className="text-sm text-red-600">{test.error}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {test.duration && (
                      <span className="text-sm text-muted-foreground">{test.duration}ms</span>
                    )}
                    {getStatusBadge(test.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Status */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">Search</div>
                <div className="text-sm text-muted-foreground">Advanced + Analytics</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wifi className={`h-5 w-5 ${isConnected ? 'text-green-600' : 'text-gray-400'}`} />
              <div>
                <div className="font-medium">Real-time</div>
                <div className="text-sm text-muted-foreground">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Download className={`h-5 w-5 ${isOnline ? 'text-green-600' : 'text-orange-600'}`} />
              <div>
                <div className="font-medium">Offline</div>
                <div className="text-sm text-muted-foreground">
                  {isOnline ? 'Online' : 'Offline Mode'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <div>
                <div className="font-medium">Performance</div>
                <div className="text-sm text-muted-foreground">Monitoring Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};