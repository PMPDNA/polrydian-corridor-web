import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

export const useSessionTimeout = () => {
  const { toast } = useToast();

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    toast({
      title: 'Session Expired',
      description: 'You have been logged out due to inactivity.',
      variant: 'destructive',
    });
  }, [toast]);

  const showWarning = useCallback(() => {
    toast({
      title: 'Session Expiring Soon',
      description: 'Your session will expire in 5 minutes due to inactivity. Click anywhere to extend.',
      duration: 10000,
    });
  }, [toast]);

  const resetTimeout = useCallback(() => {
    // Clear existing timers
    if (typeof window !== 'undefined') {
      const existingWarning = (window as any).sessionWarningTimeout;
      const existingTimeout = (window as any).sessionTimeout;
      
      if (existingWarning) clearTimeout(existingWarning);
      if (existingTimeout) clearTimeout(existingTimeout);

      // Set new timers
      (window as any).sessionWarningTimeout = setTimeout(showWarning, SESSION_TIMEOUT - WARNING_TIME);
      (window as any).sessionTimeout = setTimeout(signOut, SESSION_TIMEOUT);
    }
  }, [showWarning, signOut]);

  useEffect(() => {
    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const resetOnActivity = () => {
      resetTimeout();
    };

    // Check if user is authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        resetTimeout();
        activities.forEach(activity => {
          document.addEventListener(activity, resetOnActivity, true);
        });
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        resetTimeout();
        activities.forEach(activity => {
          document.addEventListener(activity, resetOnActivity, true);
        });
      } else if (event === 'SIGNED_OUT') {
        // Clear timers on sign out
        if (typeof window !== 'undefined') {
          const existingWarning = (window as any).sessionWarningTimeout;
          const existingTimeout = (window as any).sessionTimeout;
          
          if (existingWarning) clearTimeout(existingWarning);
          if (existingTimeout) clearTimeout(existingTimeout);
        }
        
        activities.forEach(activity => {
          document.removeEventListener(activity, resetOnActivity, true);
        });
      }
    });

    return () => {
      activities.forEach(activity => {
        document.removeEventListener(activity, resetOnActivity, true);
      });
      subscription.unsubscribe();
      
      // Clear timers on cleanup
      if (typeof window !== 'undefined') {
        const existingWarning = (window as any).sessionWarningTimeout;
        const existingTimeout = (window as any).sessionTimeout;
        
        if (existingWarning) clearTimeout(existingWarning);
        if (existingTimeout) clearTimeout(existingTimeout);
      }
    };
  }, [resetTimeout]);

  return { resetTimeout };
};