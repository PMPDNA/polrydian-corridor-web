import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/SafeErrorBoundary";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import SupabaseProtectedRoute from "@/components/SupabaseProtectedRoute";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Insights from "./pages/Insights";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import CookieSettings from "./pages/CookieSettings";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import ContributeArticle from "./pages/ContributeArticle";
import Schedule from "./pages/Schedule";
import ProfileManager from "./pages/ProfileManager";
import ResetPassword from "./pages/ResetPassword";
import { AuthCallback } from "./pages/AuthCallback";
import AdminPage from "./pages/AdminPage";


import SocialMediaDashboard from "./pages/admin/SocialMediaDashboard";
import HeroEditor from "./pages/admin/HeroEditor";
import ContentManager from "./pages/admin/ContentManager";
import ArticleManager from "./pages/admin/ArticleManager";
import FredDashboard from "./pages/admin/FredDashboard";
import ImageManager from "./pages/admin/ImageManager";

import SecurityDashboard from "./pages/SecurityDashboard";
import Analytics from "./pages/Analytics";
import Search from "./pages/Search";

import NotFound from "./pages/NotFound";
import CookieConsent from "./components/CookieConsent";

import { ScrollToTop } from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => {
  // Initialize session timeout monitoring
  useSessionTimeout();
  
  return (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
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
            <Route path="/articles/:slug" element={<ArticleDetail />} />
            <Route path="/contribute" element={<ContributeArticle />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/admin" element={
              <ErrorBoundary>
                <AdminPage />
              </ErrorBoundary>
            } />
            <Route path="/admin/profile" element={
              <ErrorBoundary>
                <ProfileManager />
              </ErrorBoundary>
            } />
            <Route path="/admin/social-dashboard" element={
              <ErrorBoundary>
                <SupabaseProtectedRoute requireAdmin={true}>
                  <SocialMediaDashboard />
                </SupabaseProtectedRoute>
              </ErrorBoundary>
            } />
            <Route path="/admin/content" element={
              <ErrorBoundary>
                <SupabaseProtectedRoute requireAdmin={true}>
                  <ContentManager />
                </SupabaseProtectedRoute>
              </ErrorBoundary>
            } />
            <Route path="/admin/hero-editor" element={
              <ErrorBoundary>
                <SupabaseProtectedRoute requireAdmin={true}>
                  <HeroEditor />
                </SupabaseProtectedRoute>
              </ErrorBoundary>
            } />
            <Route path="/admin/articles" element={
              <ErrorBoundary>
                <SupabaseProtectedRoute requireAdmin={true}>
                  <ArticleManager />
                </SupabaseProtectedRoute>
              </ErrorBoundary>
            } />
            <Route path="/admin/fred" element={
              <ErrorBoundary>
                <SupabaseProtectedRoute requireAdmin={true}>
                  <FredDashboard />
                </SupabaseProtectedRoute>
              </ErrorBoundary>
            } />
            <Route path="/admin/images" element={
              <ErrorBoundary>
                <SupabaseProtectedRoute requireAdmin={true}>
                  <ImageManager />
                </SupabaseProtectedRoute>
              </ErrorBoundary>
            } />
            <Route path="/profile" element={
              <ErrorBoundary>
                <SupabaseProtectedRoute>
                  <ProfileManager />
                </SupabaseProtectedRoute>
              </ErrorBoundary>
            } />
            
            <Route path="/search" element={<Search />} />
            <Route path="/security" element={
              <ErrorBoundary>
                <SupabaseProtectedRoute requireAdmin={true}>
                  <SecurityDashboard />
                </SupabaseProtectedRoute>
              </ErrorBoundary>
            } />
            <Route path="/analytics" element={
              <ErrorBoundary>
                <SupabaseProtectedRoute requireAdmin={true}>
                  <Analytics />
                </SupabaseProtectedRoute>
              </ErrorBoundary>
            } />
            <Route path="/auth" element={<AdminPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          <ScrollToTop />
          <CookieConsent />
        </BrowserRouter>
      </TooltipProvider>
    </ErrorBoundary>
  </QueryClientProvider>
  );
};

export default App;
