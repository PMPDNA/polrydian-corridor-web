import { useEffect, useState, useCallback } from 'react'
import { useAnalytics } from '@/hooks/useAnalytics'

interface CoreWebVitals {
  LCP: number | null // Largest Contentful Paint
  FID: number | null // First Input Delay
  CLS: number | null // Cumulative Layout Shift
  FCP: number | null // First Contentful Paint
  TTFB: number | null // Time to First Byte
}

interface CustomMetrics {
  renderCount: number
  interactionLatency: number[]
  memoryUsage: number
  jsHeapSize: number
  bundleSize: number
  routeChangeTime: number
}

interface PerformanceBudget {
  LCP: number
  FID: number
  CLS: number
  FCP: number
  TTFB: number
}

const PERFORMANCE_BUDGET: PerformanceBudget = {
  LCP: 2500, // 2.5s
  FID: 100,  // 100ms
  CLS: 0.1,  // 0.1
  FCP: 1800, // 1.8s
  TTFB: 800  // 800ms
}

export function usePerformanceMonitoring() {
  const [coreVitals, setCoreVitals] = useState<CoreWebVitals>({
    LCP: null,
    FID: null,
    CLS: null,
    FCP: null,
    TTFB: null
  })
  
  const [customMetrics, setCustomMetrics] = useState<CustomMetrics>({
    renderCount: 0,
    interactionLatency: [],
    memoryUsage: 0,
    jsHeapSize: 0,
    bundleSize: 0,
    routeChangeTime: 0
  })

  const [performanceScore, setPerformanceScore] = useState<number>(0)
  const [bundleAnalysis, setBundleAnalysis] = useState<any>(null)
  const { track } = useAnalytics()

  // Measure Core Web Vitals
  useEffect(() => {
    if (typeof window === 'undefined') return

    // LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]
      setCoreVitals(prev => ({ ...prev, LCP: lastEntry.startTime }))
      track('core_vital_lcp', window.location.pathname)
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

    // FID (First Input Delay)
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      entries.forEach(entry => {
        const perfEntry = entry as any
        setCoreVitals(prev => ({ ...prev, FID: perfEntry.processingStart - perfEntry.startTime }))
        track('core_vital_fid', window.location.pathname)
      })
    })
    fidObserver.observe({ entryTypes: ['first-input'] })

    // CLS (Cumulative Layout Shift)
    let clsValue = 0
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const perfEntry = entry as any
        if (!perfEntry.hadRecentInput) {
          clsValue += perfEntry.value
        }
      }
      setCoreVitals(prev => ({ ...prev, CLS: clsValue }))
      track('core_vital_cls', window.location.pathname)
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })

    // FCP (First Contentful Paint)
    const paintObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const fcp = entries.find(entry => entry.name === 'first-contentful-paint')
      if (fcp) {
        setCoreVitals(prev => ({ ...prev, FCP: fcp.startTime }))
        track('core_vital_fcp', window.location.pathname)
      }
    })
    paintObserver.observe({ entryTypes: ['paint'] })

    // TTFB (Time to First Byte)
    const navObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const navigation = entries[0] as PerformanceNavigationTiming
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.fetchStart
        setCoreVitals(prev => ({ ...prev, TTFB: ttfb }))
        track('core_vital_ttfb', window.location.pathname)
      }
    })
    navObserver.observe({ entryTypes: ['navigation'] })

    return () => {
      lcpObserver.disconnect()
      fidObserver.disconnect()
      clsObserver.disconnect()
      paintObserver.disconnect()
      navObserver.disconnect()
    }
  }, [track])

  // Track custom metrics
  const trackRender = useCallback(() => {
    setCustomMetrics(prev => ({
      ...prev,
      renderCount: prev.renderCount + 1
    }))
  }, [])

  const trackInteraction = useCallback((latency: number) => {
    setCustomMetrics(prev => ({
      ...prev,
      interactionLatency: [...prev.interactionLatency, latency].slice(-10) // Keep last 10
    }))
  }, [])

  const trackRouteChange = useCallback((duration: number) => {
    setCustomMetrics(prev => ({
      ...prev,
      routeChangeTime: duration
    }))
    track('route_change_performance', window.location.pathname)
  }, [track])

  // Memory monitoring
  useEffect(() => {
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setCustomMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / (1024 * 1024), // MB
          jsHeapSize: memory.totalJSHeapSize / (1024 * 1024)  // MB
        }))
      }
    }

    measureMemory()
    const interval = setInterval(measureMemory, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Bundle analysis
  useEffect(() => {
    const analyzeBundle = async () => {
      if ('performance' in window) {
        const entries = performance.getEntriesByType('resource')
        const jsFiles = entries.filter(entry => 
          entry.name.includes('.js') && !entry.name.includes('chunk')
        )
        
        const totalSize = jsFiles.reduce((size, file) => {
          return size + ((file as any).transferSize || 0)
        }, 0)

        const analysis = {
          totalJSSize: totalSize / 1024, // KB
          fileCount: jsFiles.length,
          largestFile: jsFiles.reduce((largest, file) => 
            ((file as any).transferSize || 0) > ((largest as any)?.transferSize || 0) ? file : largest
          , null),
          opportunities: identifyOptimizations(jsFiles)
        }

        setBundleAnalysis(analysis)
        setCustomMetrics(prev => ({
          ...prev,
          bundleSize: totalSize / 1024
        }))
      }
    }

    // Delay analysis to ensure all resources are loaded
    setTimeout(analyzeBundle, 3000)
  }, [])

  // Calculate performance score
  useEffect(() => {
    const calculateScore = () => {
      let score = 100
      const weights = { LCP: 25, FID: 25, CLS: 25, FCP: 15, TTFB: 10 }

      Object.entries(coreVitals).forEach(([metric, value]) => {
        if (value !== null) {
          const budget = PERFORMANCE_BUDGET[metric as keyof PerformanceBudget]
          const penalty = Math.max(0, (value - budget) / budget * weights[metric as keyof typeof weights])
          score -= penalty
        }
      })

      setPerformanceScore(Math.max(0, Math.round(score)))
    }

    calculateScore()
  }, [coreVitals])

  // Identify optimization opportunities
  const identifyOptimizations = (resources: PerformanceEntry[]) => {
    const opportunities: string[] = []

    const largeFiles = resources.filter(r => ((r as any).transferSize || 0) > 50000) // 50KB
    if (largeFiles.length > 0) {
      opportunities.push(`${largeFiles.length} large JavaScript files detected`)
    }

    if (customMetrics.renderCount > 50) {
      opportunities.push('High render count - consider React.memo or useMemo')
    }

    const avgInteractionLatency = customMetrics.interactionLatency.length > 0
      ? customMetrics.interactionLatency.reduce((a, b) => a + b, 0) / customMetrics.interactionLatency.length
      : 0

    if (avgInteractionLatency > 100) {
      opportunities.push('High interaction latency - optimize event handlers')
    }

    if (customMetrics.memoryUsage > 50) {
      opportunities.push('High memory usage - check for memory leaks')
    }

    return opportunities
  }

  // Get performance insights
  const getInsights = () => {
    const insights: string[] = []

    if (coreVitals.LCP && coreVitals.LCP > PERFORMANCE_BUDGET.LCP) {
      insights.push('LCP is slow - optimize images and critical resources')
    }

    if (coreVitals.FID && coreVitals.FID > PERFORMANCE_BUDGET.FID) {
      insights.push('FID is high - reduce JavaScript execution time')
    }

    if (coreVitals.CLS && coreVitals.CLS > PERFORMANCE_BUDGET.CLS) {
      insights.push('CLS is high - ensure size attributes on images and avoid font shifts')
    }

    if (bundleAnalysis?.opportunities) {
      insights.push(...bundleAnalysis.opportunities)
    }

    return insights
  }

  return {
    coreVitals,
    customMetrics,
    performanceScore,
    bundleAnalysis,
    insights: getInsights(),
    budget: PERFORMANCE_BUDGET,
    trackRender,
    trackInteraction,
    trackRouteChange
  }
}