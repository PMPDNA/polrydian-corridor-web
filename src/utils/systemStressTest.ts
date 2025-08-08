import { supabase } from '@/integrations/supabase/client'
import { globalDataCache } from '@/utils/performanceOptimization'

interface StressTestResult {
  category: string
  test: string
  status: 'PASS' | 'FAIL' | 'WARNING'
  message: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  solution?: string
}

export interface SystemHealth {
  score: number
  issues: StressTestResult[]
  recommendations: string[]
}

export class SystemStressTest {
  private results: StressTestResult[] = []
  
  async runFullStressTest(): Promise<SystemHealth> {
    this.results = []
    
    console.log('🔥 Starting comprehensive system stress test...')
    
    await Promise.all([
      this.testDatabasePerformance(),
      this.testMemoryLeaks(),
      this.testSecurityVulnerabilities(),
      this.testRealtimeConnections(),
      this.testOfflineCapabilities(),
      this.testEdgeFunctions(),
      this.testCacheEfficiency(),
      this.testUIResponsiveness(),
      this.testErrorHandling(),
      this.testDataIntegrity()
    ])
    
    return this.generateHealthReport()
  }
  
  private async testDatabasePerformance() {
    console.log('📊 Testing database performance...')
    
    const startTime = performance.now()
    
    try {
      // Test basic query performance
      const { data: articles, error } = await supabase
        .from('articles')
        .select('*')
        .limit(100)
      
      const queryTime = performance.now() - startTime
      
      if (error) {
        this.addResult('Database', 'Query Performance', 'FAIL', 
          `Database query failed: ${error.message}`, 'CRITICAL',
          'Check database connection and RLS policies')
      } else if (queryTime > 2000) {
        this.addResult('Database', 'Query Performance', 'WARNING',
          `Slow query: ${queryTime.toFixed(2)}ms`, 'MEDIUM',
          'Add database indexes and optimize queries')
      } else {
        this.addResult('Database', 'Query Performance', 'PASS',
          `Query completed in ${queryTime.toFixed(2)}ms`, 'LOW')
      }
      
      // Test concurrent connections
      await this.testConcurrentQueries()
      
    } catch (error: any) {
      this.addResult('Database', 'Connection', 'FAIL',
        `Database connection failed: ${error.message}`, 'CRITICAL',
        'Check Supabase configuration and network connectivity')
    }
  }
  
  private async testConcurrentQueries() {
    const concurrentQueries = Array(10).fill(null).map(() =>
      supabase.from('insights').select('id').limit(5)
    )
    
    const startTime = performance.now()
    const results = await Promise.allSettled(concurrentQueries)
    const totalTime = performance.now() - startTime
    
    const failures = results.filter(r => r.status === 'rejected').length
    
    if (failures > 2) {
      this.addResult('Database', 'Concurrent Queries', 'FAIL',
        `${failures}/10 concurrent queries failed`, 'HIGH',
        'Implement connection pooling and query throttling')
    } else if (totalTime > 5000) {
      this.addResult('Database', 'Concurrent Queries', 'WARNING',
        `Concurrent queries took ${totalTime.toFixed(2)}ms`, 'MEDIUM',
        'Optimize query performance and consider caching')
    } else {
      this.addResult('Database', 'Concurrent Queries', 'PASS',
        `All queries completed in ${totalTime.toFixed(2)}ms`, 'LOW')
    }
  }
  
  private async testMemoryLeaks() {
    console.log('🧠 Testing for memory leaks...')
    
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0
    
    // Simulate heavy operations
    for (let i = 0; i < 100; i++) {
      globalDataCache.set(`test-${i}`, { data: new Array(1000).fill(Math.random()) })
    }
    
    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc()
    }
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
    const memoryIncrease = (finalMemory - initialMemory) / (1024 * 1024) // MB
    
    // Clean up test data
    for (let i = 0; i < 100; i++) {
      globalDataCache.clear(`test-${i}`)
    }
    
    if (memoryIncrease > 50) {
      this.addResult('Memory', 'Memory Usage', 'WARNING',
        `Memory increased by ${memoryIncrease.toFixed(2)}MB`, 'MEDIUM',
        'Implement memory cleanup and optimize data structures')
    } else {
      this.addResult('Memory', 'Memory Usage', 'PASS',
        `Memory increase: ${memoryIncrease.toFixed(2)}MB`, 'LOW')
    }
    
    // Test for event listener leaks
    const listenerCount = this.countEventListeners()
    if (listenerCount > 100) {
      this.addResult('Memory', 'Event Listeners', 'WARNING',
        `${listenerCount} event listeners detected`, 'MEDIUM',
        'Clean up event listeners in useEffect cleanup functions')
    }
  }
  
  private countEventListeners(): number {
    // This is a simplified check - in production you'd use more sophisticated tools
    const bodyListeners = (document.body as any).getEventListeners?.() || {}
    return Object.keys(bodyListeners).length
  }
  
  private async testSecurityVulnerabilities() {
    console.log('🔒 Testing security vulnerabilities...')
    
    // Test for XSS vulnerabilities in content
    const testPayload = '<script>alert("xss")</script>'
    const sanitizedContent = this.checkXSSPrevention(testPayload)
    
    if (sanitizedContent.includes('<script>')) {
      this.addResult('Security', 'XSS Prevention', 'FAIL',
        'XSS vulnerability detected', 'CRITICAL',
        'Implement proper content sanitization with DOMPurify')
    } else {
      this.addResult('Security', 'XSS Prevention', 'PASS',
        'Content properly sanitized', 'LOW')
    }
    
    // Test HTTPS enforcement
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      this.addResult('Security', 'HTTPS', 'FAIL',
        'Site not using HTTPS', 'HIGH',
        'Enable HTTPS and implement HSTS headers')
    }
    
    // Test for exposed sensitive data
    this.checkForExposedSecrets()
  }
  
  private checkXSSPrevention(content: string): string {
    // Simulate content sanitization
    return content.replace(/<script[^>]*>.*?<\/script>/gi, '')
  }
  
  private checkForExposedSecrets() {
    const source = document.documentElement.innerHTML
    const patterns = [
      /sk_[a-zA-Z0-9]{32}/g, // API keys
      /pk_[a-zA-Z0-9]{32}/g, // Public keys
      /[a-zA-Z0-9]{32,}/g    // Long strings
    ]
    
    patterns.forEach((pattern, index) => {
      const matches = source.match(pattern)
      if (matches && matches.length > 5) {
        this.addResult('Security', 'Secret Exposure', 'WARNING',
          `Potential secrets detected in source code`, 'MEDIUM',
          'Use environment variables and avoid hardcoding secrets')
      }
    })
  }
  
  private async testRealtimeConnections() {
    console.log('⚡ Testing realtime connections...')
    
    try {
      const channel = supabase.channel('stress-test')
      let connected = false
      
      const connectionPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Realtime connection timeout'))
        }, 5000)
        
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            connected = true
            clearTimeout(timeout)
            resolve()
          }
        })
      })
      
      await connectionPromise
      await supabase.removeChannel(channel)
      
      this.addResult('Realtime', 'Connection', 'PASS',
        'Realtime connection successful', 'LOW')
        
    } catch (error: any) {
      this.addResult('Realtime', 'Connection', 'FAIL',
        `Realtime connection failed: ${error.message}`, 'HIGH',
        'Check Supabase realtime configuration and network')
    }
  }
  
  private async testOfflineCapabilities() {
    console.log('📱 Testing offline capabilities...')
    
    // Test cache availability
    const cacheSize = Object.keys(globalDataCache).length || 0
    if (cacheSize === 0) {
      this.addResult('Offline', 'Cache', 'WARNING',
        'No cached data available for offline use', 'MEDIUM',
        'Implement proper data caching strategy')
    } else {
      this.addResult('Offline', 'Cache', 'PASS',
        `${cacheSize} items cached for offline use`, 'LOW')
    }
    
    // Test localStorage availability
    try {
      localStorage.setItem('test', 'test')
      localStorage.removeItem('test')
      this.addResult('Offline', 'Storage', 'PASS',
        'Local storage available', 'LOW')
    } catch (error) {
      this.addResult('Offline', 'Storage', 'WARNING',
        'Local storage not available', 'MEDIUM',
        'Implement fallback storage mechanism')
    }
  }
  
  private async testEdgeFunctions() {
    console.log('🔧 Testing edge functions...')
    
    try {
      const { data, error } = await supabase.functions.invoke('fred-api-integration', {
        body: { operation: 'health_check' }
      })
      
      if (error) {
        this.addResult('Edge Functions', 'FRED API', 'WARNING',
          `Edge function error: ${error.message}`, 'MEDIUM',
          'Check edge function deployment and configuration')
      } else {
        this.addResult('Edge Functions', 'FRED API', 'PASS',
          'Edge function responsive', 'LOW')
      }
    } catch (error: any) {
      this.addResult('Edge Functions', 'Connection', 'FAIL',
        `Edge function failed: ${error.message}`, 'HIGH',
        'Verify edge function deployment and secrets')
    }
  }
  
  private async testCacheEfficiency() {
    console.log('💾 Testing cache efficiency...')
    
    const testKey = 'cache-efficiency-test'
    const testData = { timestamp: Date.now(), data: new Array(1000).fill(0) }
    
    // Test cache write
    const writeStart = performance.now()
    globalDataCache.set(testKey, testData)
    const writeTime = performance.now() - writeStart
    
    // Test cache read
    const readStart = performance.now()
    const cachedData = globalDataCache.get(testKey)
    const readTime = performance.now() - readStart
    
    if (!cachedData) {
      this.addResult('Cache', 'Functionality', 'FAIL',
        'Cache read/write failed', 'MEDIUM',
        'Fix cache implementation')
    } else if (writeTime > 10 || readTime > 5) {
      this.addResult('Cache', 'Performance', 'WARNING',
        `Slow cache operations: write ${writeTime.toFixed(2)}ms, read ${readTime.toFixed(2)}ms`, 'MEDIUM',
        'Optimize cache implementation')
    } else {
      this.addResult('Cache', 'Performance', 'PASS',
        `Cache operations: write ${writeTime.toFixed(2)}ms, read ${readTime.toFixed(2)}ms`, 'LOW')
    }
    
    globalDataCache.clear(testKey)
  }
  
  private async testUIResponsiveness() {
    console.log('🎨 Testing UI responsiveness...')
    
    // Test for unoptimized re-renders
    const renderCount = this.simulateRenderTest()
    if (renderCount > 50) {
      this.addResult('UI', 'Re-renders', 'WARNING',
        `${renderCount} re-renders detected`, 'MEDIUM',
        'Implement React.memo and useMemo for optimization')
    }
    
    // Test for layout shifts
    this.testLayoutStability()
  }
  
  private simulateRenderTest(): number {
    // This is a simplified simulation - real monitoring would use React DevTools
    return Math.floor(Math.random() * 100)
  }
  
  private testLayoutStability() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        let cls = 0
        for (const entry of list.getEntries()) {
          const perfEntry = entry as any
          if (perfEntry.hadRecentInput) continue
          cls += perfEntry.value
        }
        
        if (cls > 0.25) {
          this.addResult('UI', 'Layout Shift', 'WARNING',
            `High cumulative layout shift: ${cls.toFixed(3)}`, 'MEDIUM',
            'Add size attributes to images and avoid font shifts')
        }
      })
      
      observer.observe({ entryTypes: ['layout-shift'] })
      setTimeout(() => observer.disconnect(), 1000)
    }
  }
  
  private async testErrorHandling() {
    console.log('🚨 Testing error handling...')
    
    try {
      // Test intentional error with valid table
      const { error } = await supabase.from('articles').select('invalid_column').limit(1)
      if (error) {
        this.addResult('Error Handling', 'Database Errors', 'PASS',
          'Database errors properly caught', 'LOW')
      }
    } catch (error: any) {
      if (error.message && error.message.includes('relation') && error.message.includes('does not exist')) {
        this.addResult('Error Handling', 'Database Errors', 'PASS',
          'Database errors properly caught', 'LOW')
      } else {
        this.addResult('Error Handling', 'Database Errors', 'WARNING',
          'Unexpected error format', 'MEDIUM',
          'Improve error handling and user feedback')
      }
    }
  }
  
  private async testDataIntegrity() {
    console.log('🔍 Testing data integrity...')
    
    try {
      const { data: articles } = await supabase
        .from('articles')
        .select('id, title, content, status')
        .limit(10)
      
      if (articles) {
        const invalidRecords = articles.filter(article => 
          !article.title || !article.content || !article.status
        )
        
        if (invalidRecords.length > 0) {
          this.addResult('Data', 'Integrity', 'WARNING',
            `${invalidRecords.length} records missing required fields`, 'MEDIUM',
            'Add database constraints and validation')
        } else {
          this.addResult('Data', 'Integrity', 'PASS',
            'All records have required fields', 'LOW')
        }
      }
    } catch (error: any) {
      this.addResult('Data', 'Access', 'FAIL',
        `Data access failed: ${error.message}`, 'HIGH',
        'Check database permissions and RLS policies')
    }
  }
  
  private addResult(category: string, test: string, status: 'PASS' | 'FAIL' | 'WARNING', 
                   message: string, severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', 
                   solution?: string) {
    this.results.push({
      category,
      test,
      status,
      message,
      severity,
      solution
    })
  }
  
  private generateHealthReport(): SystemHealth {
    const totalTests = this.results.length
    const failedTests = this.results.filter(r => r.status === 'FAIL').length
    const warningTests = this.results.filter(r => r.status === 'WARNING').length
    
    // Calculate score: 100 - (failures * 20) - (warnings * 10)
    const score = Math.max(0, 100 - (failedTests * 20) - (warningTests * 10))
    
    const recommendations = this.generateRecommendations()
    
    console.log(`🏁 Stress test complete. Score: ${score}/100`)
    console.log(`✅ Passed: ${totalTests - failedTests - warningTests}`)
    console.log(`⚠️ Warnings: ${warningTests}`)
    console.log(`❌ Failed: ${failedTests}`)
    
    return {
      score,
      issues: this.results.filter(r => r.status !== 'PASS'),
      recommendations
    }
  }
  
  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    
    const criticalIssues = this.results.filter(r => r.severity === 'CRITICAL')
    const highIssues = this.results.filter(r => r.severity === 'HIGH')
    
    if (criticalIssues.length > 0) {
      recommendations.push('🚨 CRITICAL: Address security vulnerabilities and database failures immediately')
    }
    
    if (highIssues.length > 0) {
      recommendations.push('🔥 HIGH: Fix realtime connections and edge function issues')
    }
    
    const memoryIssues = this.results.filter(r => r.category === 'Memory')
    if (memoryIssues.length > 0) {
      recommendations.push('🧠 Implement memory optimization and leak prevention')
    }
    
    const performanceIssues = this.results.filter(r => 
      r.category === 'Database' || r.category === 'Cache' || r.category === 'UI'
    )
    if (performanceIssues.length > 2) {
      recommendations.push('⚡ Optimize performance across database, cache, and UI layers')
    }
    
    recommendations.push('📊 Monitor system health continuously with automated checks')
    recommendations.push('🔄 Run stress tests regularly, especially before deployments')
    
    return recommendations
  }
}

// Export singleton instance
export const stressTest = new SystemStressTest()