import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { getUserDisplayName, isUserAdminSync, getUserRole, clearUserRoleCache } from '@/utils/userUtils'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<any>
  isAdmin: boolean
  displayName: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  const displayName = getUserDisplayName(user)

  // Load user role when user changes
  useEffect(() => {
    if (user?.id) {
      // First check sync cache
      setIsAdmin(isUserAdminSync(user))
      
      // Then load fresh role from database
      getUserRole(user.id).then(role => {
        setIsAdmin(role === 'admin')
      }).catch(error => {
        console.warn('Failed to load user role:', error)
        setIsAdmin(false)
      })
    } else {
      setIsAdmin(false)
    }
  }, [user?.id])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Clear role cache when user changes
      if (session?.user?.id) {
        clearUserRoleCache(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: email === 'patrick.misiewicz@polrydian.com' ? 'Patrick Misiewicz' : 
                       email === 'polrydian@gmail.com' ? 'Patrick Misiewicz' : 'User',
          name: email === 'patrick.misiewicz@polrydian.com' ? 'Patrick Misiewicz' : 
                email === 'polrydian@gmail.com' ? 'Patrick Misiewicz' : 'User'
        }
      }
    })
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    // Enhanced security logging
    if (error) {
      const { logFailedAuth } = await import('@/lib/security-monitoring')
      await logFailedAuth(email, error.message)
    } else if (data.user) {
      const { logSuccessfulAuth } = await import('@/lib/security-monitoring')
      await logSuccessfulAuth(data.user.id, 'email')
    }
    
    return { data, error }
  }

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`
    console.log('Sending password reset to:', email, 'with redirect:', redirectUrl)
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isAdmin,
    displayName,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider')
  }
  return context
}