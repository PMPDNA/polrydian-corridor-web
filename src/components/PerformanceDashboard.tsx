import React, { useState } from 'react'
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Zap, 
  Eye, 
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Package
} from 'lucide-react'

export const PerformanceDashboard: React.FC = () => {
  const {
    coreVitals,
    customMetrics,
    performanceScore,
    bundleAnalysis,
    insights,
    budget
  } = usePerformanceMonitoring()

  const [selectedTab, setSelectedTab] = useState('overview')

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getVitalStatus = (value: number | null, budget: number) => {
    if (value === null) return 'unknown'
    if (value <= budget) return 'good'
    if (value <= budget * 1.5) return 'needs-improvement'
    return 'poor'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600'
      case 'needs-improvement': return 'text-yellow-600'
      case 'poor': return 'text-red-600'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4" />
      case 'needs-improvement': return <Clock className="h-4 w-4" />
      case 'poor': return <AlertTriangle className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  const formatTime = (ms: number | null) => {
    if (ms === null) return 'N/A'
    return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`
  }

  return (
    <div className="space-y-6">
      {/* Performance Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">
              <span className={getScoreColor(performanceScore)}>
                {performanceScore}
              </span>
              <span className="text-2xl text-muted-foreground">/100</span>
            </div>
            <div className="flex-1">
              <Progress value={performanceScore} className="h-3" />
            </div>
            <Badge variant={performanceScore >= 90 ? "default" : performanceScore >= 70 ? "secondary" : "destructive"}>
              {performanceScore >= 90 ? 'Excellent' : performanceScore >= 70 ? 'Good' : 'Needs Work'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      {insights.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Performance Recommendations:</p>
              {insights.map((insight, index) => (
                <p key={index} className="text-sm">• {insight}</p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="custom">Custom Metrics</TabsTrigger>
          <TabsTrigger value="bundle">Bundle Analysis</TabsTrigger>
        </TabsList>

        {/* Core Web Vitals */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* LCP */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Largest Contentful Paint
                  </span>
                  {getStatusIcon(getVitalStatus(coreVitals.LCP, budget.LCP))}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className={`text-2xl font-bold ${getStatusColor(getVitalStatus(coreVitals.LCP, budget.LCP))}`}>
                    {formatTime(coreVitals.LCP)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Target: {formatTime(budget.LCP)}
                  </div>
                  <Progress 
                    value={coreVitals.LCP ? Math.min(100, (budget.LCP / coreVitals.LCP) * 100) : 0} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* FID */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    First Input Delay
                  </span>
                  {getStatusIcon(getVitalStatus(coreVitals.FID, budget.FID))}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className={`text-2xl font-bold ${getStatusColor(getVitalStatus(coreVitals.FID, budget.FID))}`}>
                    {formatTime(coreVitals.FID)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Target: {formatTime(budget.FID)}
                  </div>
                  <Progress 
                    value={coreVitals.FID ? Math.min(100, (budget.FID / coreVitals.FID) * 100) : 0} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* CLS */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    Cumulative Layout Shift
                  </span>
                  {getStatusIcon(getVitalStatus(coreVitals.CLS, budget.CLS))}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className={`text-2xl font-bold ${getStatusColor(getVitalStatus(coreVitals.CLS, budget.CLS))}`}>
                    {coreVitals.CLS?.toFixed(3) || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Target: {budget.CLS}
                  </div>
                  <Progress 
                    value={coreVitals.CLS ? Math.min(100, (budget.CLS / coreVitals.CLS) * 100) : 0} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Metrics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">First Contentful Paint</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold">{formatTime(coreVitals.FCP)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Time to First Byte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-semibold">{formatTime(coreVitals.TTFB)}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Custom Metrics */}
        <TabsContent value="custom" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Render Count</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customMetrics.renderCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Avg Interaction Latency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {customMetrics.interactionLatency.length > 0
                    ? `${Math.round(customMetrics.interactionLatency.reduce((a, b) => a + b, 0) / customMetrics.interactionLatency.length)}ms`
                    : 'N/A'
                  }
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customMetrics.memoryUsage.toFixed(1)}MB</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">JS Heap Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customMetrics.jsHeapSize.toFixed(1)}MB</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bundle Analysis */}
        <TabsContent value="bundle" className="space-y-4">
          {bundleAnalysis ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Bundle Size
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold">{bundleAnalysis.totalJSSize.toFixed(1)}KB</div>
                    <div className="text-sm text-muted-foreground">Total JavaScript</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold">{bundleAnalysis.fileCount}</div>
                    <div className="text-sm text-muted-foreground">JavaScript Files</div>
                  </div>
                  {bundleAnalysis.largestFile && (
                    <div>
                      <div className="text-sm font-medium">Largest File:</div>
                      <div className="text-xs text-muted-foreground break-all">
                        {bundleAnalysis.largestFile.name} ({Math.round(bundleAnalysis.largestFile.transferSize / 1024)}KB)
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Optimization Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bundleAnalysis.opportunities.length > 0 ? (
                    <div className="space-y-2">
                      {bundleAnalysis.opportunities.map((opportunity: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{opportunity}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Bundle is well optimized!</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Bundle analysis loading...
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}