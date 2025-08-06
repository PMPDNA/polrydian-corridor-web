import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { useErrorHandler, dbOperations } from '@/utils/errorHandling'
import { useOptimizedData, globalDataCache } from '@/utils/performanceOptimization'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isAdmin: boolean
  needsMFA: boolean
  displayName: string
  signUp: (email: string, password: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface SupabaseAuthProviderProps {
  children: ReactNode
}

export function SupabaseAuthProvider({ children }: SupabaseAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [needsMFA, setNeedsMFA] = useState(false)
  const { handleError, createAsyncHandler } = useErrorHandler()

  // Optimized user role fetching
  const { data: userRole, updateOptimistically: updateUserRole } = useOptimizedData(
    user ? `user-role-${user.id}` : 'no-user',
    async () => {
      if (!user?.id) return null
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()
        
      if (error) return null
      return data
    },
    { cache: true, cacheTTL: 10 * 60 * 1000 } // 10 minutes cache
  )

  // Update admin status when user role changes
  useEffect(() => {
    setIsAdmin((userRole as any)?.role === 'admin')
  }, [userRole])

  // Enhanced display name generation
  const displayName = React.useMemo(() => {
    if (!user) return ''
    
    const metadata = user.user_metadata || {}
    const name = metadata.display_name || metadata.name || metadata.full_name
    
    if (name) return name
    
    if (user.email) {
      const username = user.email.split('@')[0]
      return username.charAt(0).toUpperCase() + username.slice(1)
    }
    
    return 'User'
  }, [user])

  // Check MFA requirements
  const checkMFARequirements = useCallback(async (currentUser: User) => {
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors()
      const hasTOTP = factors?.totp?.length > 0

      if (hasTOTP) {
        const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
        const needsVerification = data?.currentLevel !== data?.nextLevel
        setNeedsMFA(needsVerification)
      } else {
        setNeedsMFA(false)
      }
    } catch (error) {
      console.warn('MFA check failed:', error)
      setNeedsMFA(false)
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            await checkMFARequirements(session.user)
          }
        }
      } catch (error) {
        if (mounted) {
          handleError(error, { action: 'Auth initialization' })
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await checkMFARequirements(session.user)
        } else {
          setNeedsMFA(false)
          setIsAdmin(false)
          // Clear user-related cache on logout
          globalDataCache.clear('user-')
        }
        
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [checkMFARequirements, handleError])

  // Enhanced auth methods with proper error handling
  const signUp = createAsyncHandler(
    async (email: string, password: string) => {
      const redirectUrl = `${window.location.origin}/`
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl }
      })
      
      if (error) throw error
      return data
    },
    { action: 'Sign up', title: 'Sign Up Failed' }
  )

  const signIn = createAsyncHandler(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error

      // Check MFA after successful sign in
      if (data.user) {
        const { data: factors } = await supabase.auth.mfa.listFactors()
        if (factors?.totp?.length > 0) {
          setNeedsMFA(true)
        }
      }
      
      return data
    },
    { action: 'Sign in', title: 'Sign In Failed' }
  )

  const resetPassword = createAsyncHandler(
    async (email: string) => {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) throw error
      return data
    },
    { action: 'Password reset', title: 'Password Reset Failed' }
  )

  const signOut = createAsyncHandler(
    async () => {
      await supabase.auth.signOut()
      // Clear all cache on sign out
      globalDataCache.clear()
    },
    { action: 'Sign out', title: 'Sign Out Failed' }
  )

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAdmin,
    needsMFA,
    displayName,
    signUp: signUp!,
    signIn: signIn!,
    signOut: signOut!,
    resetPassword: resetPassword!,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider')
  }
  return context
}