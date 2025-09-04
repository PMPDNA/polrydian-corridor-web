import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { logSecurityEvent } from '@/lib/security-monitoring';
import { toast } from 'sonner';
import { getOrigin } from '@/lib/safe-utils';
import { getUserDisplayName, isUserAdminSync, getUserRole, clearUserRoleCache } from '@/utils/userUtils';

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
    let mounted = true;

    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted && session?.user) {
          // Check if user has MFA enabled
          const { data: factors } = await supabase.auth.mfa.listFactors();
          const hasMFAEnabled = factors?.totp && factors.totp.length > 0;
          
          if (hasMFAEnabled) {
            // Verify current assurance level
            const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
            
            if (data?.currentLevel !== 'aal2') {
              // MFA required but not completed - force logout and show MFA
              console.warn('MFA required but not verified. Logging out.');
              await supabase.auth.signOut();
              setNeedsMFA(true);
              setSession(null);
              setUser(null);
              setLoading(false);
              return;
            }
          }
          
          setSession(session);
          setUser(session.user);
          setNeedsMFA(false);
        } else {
          setSession(null);
          setUser(null);
          setNeedsMFA(false);
        }
        
        if (mounted) setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
          setSession(null);
          setUser(null);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, {
        hasSession: !!session,
        hasUser: !!session?.user,
        needsMFA: needsMFA
      });
      
      // Handle session updates
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Clear role cache when user changes
      if (session?.user?.id) {
        clearUserRoleCache(session.user.id);
      }
      
      // Handle MFA logic separately with timeout
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        setTimeout(async () => {
          try {
            const { data: factors } = await supabase.auth.mfa.listFactors();
            const hasMFAEnabled = factors?.totp && factors.totp.length > 0;
            
            if (hasMFAEnabled) {
              const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
              console.log('MFA assurance level:', data?.currentLevel);
              
              if (data?.currentLevel !== 'aal2') {
                console.log('Setting needsMFA to true');
                setNeedsMFA(true);
              } else {
                console.log('Setting needsMFA to false - AAL2 verified');
                setNeedsMFA(false);
              }
            } else {
              setNeedsMFA(false);
            }
          } catch (error) {
            console.error('MFA check error:', error);
            setNeedsMFA(false);
          }
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setNeedsMFA(false);
      }
    });

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    // Enhanced input validation for signup
    if (!email || !password) {
      return { data: null, error: { message: 'Email and password are required' } }
    }
    
    if (email.length > 254 || password.length > 128) {
      return { data: null, error: { message: 'Invalid input length' } }
    }
    
    if (password.length < 8) {
      return { data: null, error: { message: 'Password must be at least 8 characters' } }
    }
    
    const redirectUrl = `${getOrigin()}/`
    
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
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
      console.log('Attempting sign in for user');
      
      // Enhanced input validation
      if (!email || !password) {
        throw new Error('Email and password are required')
      }
      
      if (email.length > 254 || password.length > 128) {
        throw new Error('Invalid input length')
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
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
      
      // Enhanced security logging (mask email for privacy)
      try {
        const { logFailedAuth } = await import('@/lib/security-monitoring')
        const maskedEmail = email.replace(/(.{2}).*(@.*)/, '$1***$2')
        await logFailedAuth(maskedEmail, error.message)
      } catch (logError) {
        console.warn('Failed to log auth attempt:', logError)
      }
      
      return { data: null, error };
    }
  }

  const resetPassword = async (email: string) => {
    const redirectUrl = `${getOrigin()}/reset-password`
    const maskedEmail = email.replace(/(.{2}).*(@.*)/, '$1***$2')
    console.log('Sending password reset to user:', maskedEmail, 'with redirect:', redirectUrl)
    
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