import { createRoot } from 'react-dom/client'
import { SupabaseAuthProvider } from '@/hooks/useSupabaseAuth'
import App from './App.tsx'
import './index.css'
import { initializeSecurity } from './hooks/useSecurityHeaders'
import { HelmetProvider } from 'react-helmet-async'

// Initialize secure CSP management
import './lib/security-csp'

// Global error handlers for better diagnostics
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global Error:', { message, source, lineno, colno, error });
  return false; // Let default handler run
};

window.onunhandledrejection = (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
};

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