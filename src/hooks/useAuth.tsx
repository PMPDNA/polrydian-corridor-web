import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple password - in a real app, this would be handled server-side
const ADMIN_PASSWORD = 'admin123'; // TODO: Move to environment variable

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user was previously authenticated (session-based, not localStorage)
    const sessionAuth = sessionStorage.getItem('auth_session');
    const sessionTime = sessionStorage.getItem('auth_time');
    
    if (sessionAuth && sessionTime) {
      const authTime = parseInt(sessionTime);
      const currentTime = Date.now();
      // Session expires after 2 hours
      if (currentTime - authTime < 2 * 60 * 60 * 1000) {
        setIsAuthenticated(true);
      } else {
        // Session expired
        sessionStorage.removeItem('auth_session');
        sessionStorage.removeItem('auth_time');
      }
    }
  }, []);

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('auth_session', 'true');
      sessionStorage.setItem('auth_time', Date.now().toString());
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('auth_session');
    sessionStorage.removeItem('auth_time');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}