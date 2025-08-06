import { useToast } from "@/hooks/use-toast"

export interface ErrorHandlerOptions {
  title?: string
  action?: string
  showDetails?: boolean
  logLevel?: 'error' | 'warn' | 'info'
}

export interface AsyncOperationState<T = any> {
  data: T | null
  loading: boolean
  error: string | null
}

// Standardized error handling utility
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// Custom hook for standardized error handling
export function useErrorHandler() {
  const { toast } = useToast()

  const handleError = (
    error: any, 
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      title = "Error",
      action = "Operation failed",
      showDetails = false,
      logLevel = 'error'
    } = options

    // Log the error
    const logMessage = `${action}: ${error.message || error}`
    switch (logLevel) {
      case 'error':
        console.error(logMessage, error)
        break
      case 'warn':
        console.warn(logMessage, error)
        break
      case 'info':
        console.info(logMessage, error)
        break
    }

    // Show user-friendly toast
    const description = showDetails 
      ? error.message || error.toString()
      : "Please try again or contact support if the problem persists."

    toast({
      title,
      description,
      variant: "destructive",
    })
  }

  const createAsyncHandler = <T extends any[], R>(
    asyncFn: (...args: T) => Promise<R>,
    options: ErrorHandlerOptions = {}
  ) => {
    return async (...args: T): Promise<R | null> => {
      try {
        return await asyncFn(...args)
      } catch (error) {
        handleError(error, options)
        return null
      }
    }
  }

  return {
    handleError,
    createAsyncHandler,
    AppError
  }
}

// Standardized async operation hook
export function useAsyncOperation<T = any>(
  defaultData: T | null = null
): [AsyncOperationState<T>, (operation: () => Promise<T>) => Promise<T | null>] {
  const [state, setState] = React.useState<AsyncOperationState<T>>({
    data: defaultData,
    loading: false,
    error: null
  })

  const { handleError } = useErrorHandler()

  const executeOperation = async (operation: () => Promise<T>): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await operation()
      setState({ data: result, loading: false, error: null })
      return result
    } catch (error: any) {
      const errorMessage = error.message || 'Operation failed'
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
      handleError(error)
      return null
    }
  }

  return [state, executeOperation]
}

// Database operation utilities
export const dbOperations = {
  async safeQuery<T>(
    queryFn: () => Promise<{ data: T | null, error: any }>,
    errorContext: string = 'Database query'
  ): Promise<T | null> {
    try {
      const { data, error } = await queryFn()
      if (error) throw new AppError(error.message, 'DB_ERROR', error)
      return data
    } catch (error) {
      console.error(`${errorContext} failed:`, error)
      return null
    }
  },

  async safeMutation<T>(
    mutationFn: () => Promise<{ data: T | null, error: any }>,
    errorContext: string = 'Database mutation'
  ): Promise<T | null> {
    try {
      const { data, error } = await mutationFn()
      if (error) throw new AppError(error.message, 'DB_ERROR', error)
      return data
    } catch (error) {
      console.error(`${errorContext} failed:`, error)
      throw error // Re-throw for mutations so UI can handle appropriately
    }
  }
}

// React import fix
import React from 'react'