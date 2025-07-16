import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SupabaseProtectedRoute from "@/components/SupabaseProtectedRoute";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Insights from "./pages/Insights";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import CookieSettings from "./pages/CookieSettings";
import Articles from "./pages/Articles";
import ProfileManager from "./pages/ProfileManager";
import ResetPassword from "./pages/ResetPassword";
import CalendlyDemo from "./pages/CalendlyDemo";
import NotFound from "./pages/NotFound";
import CookieConsent from "./components/CookieConsent";
import ScrollIndicator from "./components/ScrollIndicator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/cookie-settings" element={<CookieSettings />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/admin" element={
            <SupabaseProtectedRoute requireAdmin={true}>
              <ProfileManager />
            </SupabaseProtectedRoute>
          } />
          <Route path="/profile" element={
            <SupabaseProtectedRoute>
              <ProfileManager />
            </SupabaseProtectedRoute>
          } />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/calendly-demo" element={<CalendlyDemo />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ScrollIndicator />
        <CookieConsent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
