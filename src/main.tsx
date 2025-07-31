import { createRoot } from 'react-dom/client'
import { SupabaseAuthProvider } from '@/hooks/useSupabaseAuth'
import { validateEnvironment } from '@/lib/security-config'
import App from './App.tsx'
import './index.css'

// Initialize security features
import { applySecurityHeaders } from './lib/security-headers'
import { refreshCSPNonce } from './lib/csp-nonce'

// Apply security configuration
applySecurityHeaders()
refreshCSPNonce()

// Initialize CSRF protection
import { initializeCSRF } from './lib/enhanced-security'
initializeCSRF()

// Validate environment on startup
validateEnvironment()

createRoot(document.getElementById("root")!).render(
  <SupabaseAuthProvider>
    <App />
  </SupabaseAuthProvider>
)