import { createRoot } from 'react-dom/client'
import { SupabaseAuthProvider } from '@/hooks/useSupabaseAuth'
import App from './App.tsx'
import './index.css'

// Security initialization function
const initializeSecurity = async () => {
  try {
    console.log('🔒 Initializing security features...');
    
    // Only import and run security features if available
    const { validateEnvironment } = await import('./lib/security-config');
    const securityWarnings = validateEnvironment();
    
    if (securityWarnings && securityWarnings.length > 0) {
      console.warn('⚠️ Security configuration issues detected:', securityWarnings);
    }
    
    // Try to apply security headers safely
    try {
      const { applySecurityHeaders } = await import('./lib/security-headers');
      applySecurityHeaders();
    } catch (error) {
      console.warn('Security headers initialization skipped:', error);
    }
    
    // Try to apply CSP safely
    try {
      const { applyCSPToDocument } = await import('./lib/csp-nonce');
      applyCSPToDocument();
    } catch (error) {
      console.warn('CSP initialization skipped:', error);
    }
    
    // Try to initialize CSRF safely
    try {
      const { initializeCSRF } = await import('./lib/enhanced-security');
      initializeCSRF();
    } catch (error) {
      console.warn('CSRF initialization skipped:', error);
    }
    
  } catch (error) {
    console.warn('Security initialization failed, continuing without enhanced security:', error);
  }
};

// Initialize security in the background
initializeSecurity();

createRoot(document.getElementById("root")!).render(
  <SupabaseAuthProvider>
    <App />
  </SupabaseAuthProvider>
)