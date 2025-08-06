import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  showDetails?: boolean
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class SafeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SafeErrorBoundary caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // Log to monitoring service if available
    if (typeof window !== 'undefined' && (window as any).logError) {
      (window as any).logError('component_error', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      })
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="m-4 border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Component Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Something went wrong with this component. You can try to reload it or continue using the rest of the application.
            </p>
            
            {this.props.showDetails && this.state.error && (
              <details className="text-xs bg-muted/50 p-3 rounded">
                <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
                <div className="space-y-2 font-mono">
                  <div><strong>Message:</strong> {this.state.error.message}</div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1 text-xs">
                        {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
            
            <Button onClick={this.handleReset} size="sm" className="w-fit">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>, 
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <SafeErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </SafeErrorBoundary>
    )
  }
}