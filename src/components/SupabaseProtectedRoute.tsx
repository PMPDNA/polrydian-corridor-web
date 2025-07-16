import { ReactNode } from 'react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import SupabaseLogin from './SupabaseLogin'

interface SupabaseProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
}

export default function SupabaseProtectedRoute({ 
  children, 
  requireAdmin = false 
}: SupabaseProtectedRouteProps) {
  const { user, isAdmin, loading } = useSupabaseAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <SupabaseLogin />
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}