import { createRoot } from 'react-dom/client'
import { SupabaseAuthProvider } from '@/hooks/useSupabaseAuth'
import { validateEnvironment } from '@/lib/security-config'
import App from './App.tsx'
import './index.css'

// Validate security configuration on startup
validateEnvironment()

createRoot(document.getElementById("root")!).render(
  <SupabaseAuthProvider>
    <App />
  </SupabaseAuthProvider>
);
