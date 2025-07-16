import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SupabaseAuthProvider } from "@/hooks/useSupabaseAuth";
import SupabaseProtectedRoute from "@/components/SupabaseProtectedRoute";
import Index from "./pages/Index";
import Articles from "./pages/Articles";
import ProfileManager from "./pages/ProfileManager";
import ContentManager from "./pages/ContentManager";
import ResetPassword from "./pages/ResetPassword";
import AdminSetup from "./pages/AdminSetup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SupabaseAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/profile" element={
              <SupabaseProtectedRoute requireAdmin={true}>
                <ProfileManager />
              </SupabaseProtectedRoute>
            } />
            <Route path="/admin" element={
              <SupabaseProtectedRoute requireAdmin={true}>
                <ContentManager />
              </SupabaseProtectedRoute>
            } />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin-setup" element={<AdminSetup />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SupabaseAuthProvider>
  </QueryClientProvider>
);

export default App;
