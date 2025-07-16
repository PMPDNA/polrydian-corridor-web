import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
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
    console.log('Attempting signup with:', { email })
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: email === 'polrydian@gmail.com' ? 'Patrick Misiewicz' : 'User',
          name: email === 'polrydian@gmail.com' ? 'Patrick Misiewicz' : 'User'
        }
      }
    })
    console.log('Signup result:', { data, error })
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    console.log('Attempting signin with:', { email })
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    console.log('Signin result:', { data, error })
    return { data, error }
  }

  const resetPassword = async (email: string) => {
    console.log('Attempting password reset for:', { email })
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    console.log('Password reset result:', { data, error })
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