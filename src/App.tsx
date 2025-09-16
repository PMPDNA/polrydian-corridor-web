import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import SupabaseProtectedRoute from "@/components/SupabaseProtectedRoute";
import { SecurityMiddleware } from "@/components/SecurityMiddleware";
import { SecurityDashboard as SecurityDashboardComponent } from "@/components/SecurityDashboard";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";

import Privacy from "./pages/Privacy";

import SovereignFunds from "./pages/SovereignFunds";
import PortsLogistics from "./pages/PortsLogistics";
import DefenceTech from "./pages/DefenceTech";
import Articles from "./pages/Articles";
import ArticleDetail from "./pages/ArticleDetail";
import ContributeArticle from "./pages/ContributeArticle";
import Schedule from "./pages/Schedule";
import ProfileManager from "./pages/admin/ProfileManager";
import ResetPassword from "./pages/ResetPassword";
import { AuthCallback } from "./pages/AuthCallback";
import AdminPage from "./pages/AdminPage";


import SocialMediaDashboard from "./pages/admin/SocialMediaDashboard";
import PartnersManager from "./pages/admin/PartnersManager";
import ContentManager from "./pages/admin/ContentManager";
import ArticleManager from "./pages/admin/ArticleManager";
import FredDashboard from "./pages/admin/FredDashboard";
import ImageManager from "./pages/admin/ImageManager";
import AdminAnalytics from "./pages/admin/Analytics";

import SecurityDashboard from "./pages/SecurityDashboard";
import Analytics from "./pages/Analytics";
import Search from "./pages/Search";
import PerformanceDashboard from "./pages/admin/PerformanceDashboard";
import Sitemap from "./pages/Sitemap";
import RSS from "./pages/RSS";

import NotFound from "./pages/NotFound";


import { ScrollToTop } from "./components/ScrollToTop";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { EnhancedSEO } from "./components/EnhancedSEO";
import { StagingBanner } from "./components/StagingBanner";

const queryClient = new QueryClient();

const App = () => {
  // Initialize session timeout monitoring
  useSessionTimeout();
  
  return (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <TooltipProvider>
        <SecurityMiddleware>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <StagingBanner />
            <EnhancedSEO />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              
              {/* ICP Landing Pages */}
              <Route path="/sovereign-funds" element={<SovereignFunds />} />
              <Route path="/ports-logistics" element={<PortsLogistics />} />
              <Route path="/defence-tech" element={<DefenceTech />} />
              
              <Route path="/privacy" element={<Privacy />} />
              
              {/* Articles Section */}
              <Route path="/articles" element={<Articles />} />
              <Route path="/articles/:slug" element={<ArticleDetail />} />
              <Route path="/contribute" element={<ContributeArticle />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/admin" element={
                <ErrorBoundary>
                  <AdminPage />
                </ErrorBoundary>
              } />
              <Route path="/admin/security" element={
                <ErrorBoundary>
                  <SupabaseProtectedRoute requireAdmin={true}>
                    <SecurityDashboardComponent />
                  </SupabaseProtectedRoute>
                </ErrorBoundary>
              } />
              <Route path="/admin/profile" element={
                <ErrorBoundary>
                  <SupabaseProtectedRoute requireAdmin={true}>
                    <ProfileManager />
                  </SupabaseProtectedRoute>
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
              <Route path="/admin/partners" element={
                <ErrorBoundary>
                  <SupabaseProtectedRoute requireAdmin={true}>
                    <PartnersManager />
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
              <Route path="/admin/analytics" element={
                <ErrorBoundary>
                  <SupabaseProtectedRoute requireAdmin={true}>
                    <AdminAnalytics />
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
              <Route path="/sitemap.xml" element={<Sitemap />} />
              <Route path="/rss.xml" element={<RSS />} />
              <Route path="/security" element={
                <ErrorBoundary>
                  <SupabaseProtectedRoute requireAdmin={true}>
                    <SecurityDashboard />
                  </SupabaseProtectedRoute>
                </ErrorBoundary>
              } />
              <Route path="/admin/performance" element={
                <ErrorBoundary>
                  <SupabaseProtectedRoute requireAdmin={true}>
                    <PerformanceDashboard />
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
            <OfflineIndicator />
          </BrowserRouter>
        </SecurityMiddleware>
      </TooltipProvider>
    </ErrorBoundary>
  </QueryClientProvider>
  );
};

export default App;
