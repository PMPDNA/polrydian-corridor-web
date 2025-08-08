import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Play, 
  RefreshCw,
  Shield,
  Database,
  Zap,
  Brain,
  Monitor
} from 'lucide-react'
import { stressTest, SystemHealth, StressTestResult } from '@/utils/systemStressTest'

export function SystemStressTestDashboard() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<SystemHealth | null>(null)
  const [lastRun, setLastRun] = useState<Date | null>(null)

  const runStressTest = async () => {
    setIsRunning(true)
    try {
      const health = await stressTest.runFullStressTest()
      setResults(health)
      setLastRun(new Date())
    } catch (error) {
      console.error('Stress test failed:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'FAIL':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Security':
        return <Shield className="h-4 w-4" />
      case 'Database':
        return <Database className="h-4 w-4" />
      case 'Realtime':
        return <Zap className="h-4 w-4" />
      case 'Memory':
        return <Brain className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'destructive'
      case 'HIGH':
        return 'destructive'
      case 'MEDIUM':
        return 'secondary'
      case 'LOW':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const groupedIssues = results?.issues.reduce((acc, issue) => {
    if (!acc[issue.category]) acc[issue.category] = []
    acc[issue.category].push(issue)
    return acc
  }, {} as Record<string, StressTestResult[]>) || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Stress Test</h2>
          <p className="text-muted-foreground">
            Comprehensive system health analysis and vulnerability assessment
          </p>
        </div>
        <Button 
          onClick={runStressTest} 
          disabled={isRunning}
          size="lg"
        >
          {isRunning ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run Stress Test
            </>
          )}
        </Button>
      </div>

      {lastRun && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              System Health Score
              {results && (
                <Badge variant={results.score >= 80 ? 'default' : results.score >= 60 ? 'secondary' : 'destructive'}>
                  {results.score}/100
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Last run: {lastRun.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results && (
              <div className="space-y-4">
                <Progress value={results.score} className="w-full" />
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {(results.issues || []).filter(i => i.status === 'PASS').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Passed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {(results.issues || []).filter(i => i.status === 'WARNING').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Warnings</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {(results.issues || []).filter(i => i.status === 'FAIL').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {results?.recommendations && results.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>
              Priority actions to improve system health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.recommendations.map((rec, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{rec}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {Object.entries(groupedIssues).map(([category, issues]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getCategoryIcon(category)}
              {category} Issues
              <Badge variant="outline">{issues.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {issues.map((issue, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getStatusIcon(issue.status)}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{issue.test}</span>
                      <Badge variant={getSeverityColor(issue.severity)}>
                        {issue.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {issue.message}
                    </p>
                    {issue.solution && (
                      <div className="mt-2 p-2 bg-muted rounded text-sm">
                        <span className="font-medium">Solution: </span>
                        {issue.solution}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {!results && !isRunning && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Monitor className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Test Results</h3>
            <p className="text-muted-foreground text-center mb-4">
              Run a comprehensive stress test to identify system vulnerabilities and performance issues.
            </p>
            <Button onClick={runStressTest} variant="outline">
              <Play className="mr-2 h-4 w-4" />
              Start First Test
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}