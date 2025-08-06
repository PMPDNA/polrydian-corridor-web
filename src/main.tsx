import { createRoot } from 'react-dom/client'
import { SupabaseAuthProvider } from '@/hooks/useSupabaseAuth'
import App from './App.tsx'
import './index.css'
import { initializeSecurity } from './hooks/useSecurityHeaders'

// Initialize security features
initializeSecurity()

createRoot(document.getElementById("root")!).render(
  <SupabaseAuthProvider>
    <App />
  </SupabaseAuthProvider>
)