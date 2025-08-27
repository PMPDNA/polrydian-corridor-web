import { createRoot } from 'react-dom/client'
import { SupabaseAuthProvider } from '@/hooks/useSupabaseAuth'
import App from './App.tsx'
import './index.css'
import { initializeSecurity } from './hooks/useSecurityHeaders'
import { HelmetProvider } from 'react-helmet-async'

// Initialize secure CSP management
import './lib/security-csp'

// Initialize security features safely
try {
  initializeSecurity()
} catch (error) {
  console.warn('Security initialization failed:', error)
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <SupabaseAuthProvider>
      <App />
    </SupabaseAuthProvider>
  </HelmetProvider>
)