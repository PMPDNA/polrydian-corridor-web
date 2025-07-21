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
  needsMFA: boolean
  setNeedsMFA: (value: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [needsMFA, setNeedsMFA] = useState(false)

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
      console.log('Auth state change:', _event, (session as any)?.user?.aal)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Only clear MFA requirement if user has AAL2 (completed MFA)
      if (session?.user) {
        if ((session as any).user.aal === 'aal2') {
          console.log('User has completed MFA (AAL2), clearing needsMFA flag');
          setNeedsMFA(false);
        }
      } else {
        setNeedsMFA(false);
      }
      
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
          display_name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
          name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)
        }
      }
    })
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('Sign in successful, checking for MFA factors');
      
      // Always check if user has MFA factors after successful password login
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.find(factor => factor.status === 'verified');
      
      if (totpFactor) {
        console.log('User has MFA factor, requiring MFA verification');
        setNeedsMFA(true);
        // Do not complete the login process yet
      } else {
        console.log('No MFA required, login complete');
        setNeedsMFA(false);
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Enhanced security logging  
      try {
        const { logFailedAuth } = await import('@/lib/security-monitoring')
        await logFailedAuth(email, error.message)
      } catch (logError) {
        console.warn('Failed to log auth attempt:', logError)
      }
      
      return { data: null, error };
    }
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
    needsMFA,
    setNeedsMFA,
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