import { createRoot } from 'react-dom/client'
import { SupabaseAuthProvider } from '@/hooks/useSupabaseAuth'
import { validateEnvironment } from '@/lib/security-config'
import App from './App.tsx'
import './index.css'

// Enhanced security initialization
import { applySecurityHeaders } from './lib/security-headers'
import { applyCSPToDocument } from './lib/csp-nonce'
import { initializeCSRF } from './lib/enhanced-security'

// Apply comprehensive security configuration on startup
console.log('🔒 Initializing security features...');
applySecurityHeaders()
applyCSPToDocument()
initializeCSRF()

// Validate environment for security warnings
const securityWarnings = validateEnvironment()
if (securityWarnings.length > 0) {
  console.warn('⚠️ Security configuration issues detected:', securityWarnings);
}

createRoot(document.getElementById("root")!).render(
  <SupabaseAuthProvider>
    <App />
  </SupabaseAuthProvider>
)