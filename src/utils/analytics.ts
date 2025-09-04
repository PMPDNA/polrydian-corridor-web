// Analytics utility functions with error handling and privacy compliance
import { safeEnv, safeStorage } from '@/lib/safe-utils';

interface AnalyticsEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

// Throttle analytics storage to prevent editor slowdown
const MAX_STORED_EVENTS = 100;

// Check if analytics consent is given
const hasAnalyticsConsent = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.cookieConsent?.analytics === true;
};

export const trackEvent = ({ 
  action, 
  category = 'engagement', 
  label, 
  value, 
  custom_parameters 
}: AnalyticsEvent) => {
  try {
    // Check consent before tracking
    if (!hasAnalyticsConsent()) {
      console.debug('Analytics tracking skipped - no consent');
      return;
    }

    // Google Analytics 4
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
        ...custom_parameters
      });
    }

    // Google Tag Manager fallback
    if ((window as any).dataLayer && Array.isArray((window as any).dataLayer)) {
      (window as any).dataLayer.push({
        event: 'custom_event',
        event_action: action,
        event_category: category,
        event_label: label,
        event_value: value,
        ...custom_parameters
      });
    }

    // Send to server with consent flag
    sendAnalyticsToServer({
      action,
      category,
      label,
      value,
      custom_parameters,
      consent_given: true
    });

    // Development logging
    if (safeEnv.isDev()) {
      console.log('Analytics Event:', { action, category, label, value, custom_parameters });
    }
  } catch (error) {
    console.warn('Analytics tracking error:', error);
  }
};

export const trackPageView = (page_title: string, page_location: string) => {
  try {
    // Check consent before tracking
    if (!hasAnalyticsConsent()) {
      console.debug('Page view tracking skipped - no consent');
      return;
    }

    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('config', safeEnv.get('VITE_GA_MEASUREMENT_ID', 'GA_MEASUREMENT_ID'), {
        page_title,
        page_location,
        send_page_view: true
      });
    }

    // Send to server with consent flag
    sendAnalyticsToServer({
      action: 'page_view',
      category: 'navigation',
      label: page_title,
      custom_parameters: { page_location },
      consent_given: true
    });

    if (safeEnv.isDev()) {
      console.log('Page View:', { page_title, page_location });
    }
  } catch (error) {
    console.warn('Page view tracking error:', error);
  }
};

export const trackPerformance = (metric: string, value: number, unit: string = 'ms') => {
  try {
    // Check consent before tracking
    if (!hasAnalyticsConsent()) {
      console.debug('Performance tracking skipped - no consent');
      return;
    }

    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'timing_complete', {
        name: metric,
        value: value,
        event_category: 'performance',
        custom_map: { metric_unit: unit }
      });
    }

    // Send to server with consent flag
    sendAnalyticsToServer({
      action: 'performance_metric',
      category: 'performance',
      label: metric,
      value: Math.round(value),
      custom_parameters: { unit },
      consent_given: true
    });

    if (safeEnv.isDev()) {
      console.log('Performance Metric:', { metric, value, unit });
    }
  } catch (error) {
    console.warn('Performance tracking error:', error);
  }
};

export const trackConversion = (conversion_id: string, value?: number, currency: string = 'USD') => {
  try {
    // Check consent before tracking
    if (!hasAnalyticsConsent()) {
      console.debug('Conversion tracking skipped - no consent');
      return;
    }

    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'conversion', {
        send_to: conversion_id,
        value: value,
        currency: currency
      });
    }

    trackEvent({
      action: 'conversion',
      category: 'business',
      value: value,
      custom_parameters: { conversion_id, currency }
    });
  } catch (error) {
    console.warn('Conversion tracking error:', error);
  }
};

// Helper function to send analytics data to server
const sendAnalyticsToServer = async (data: any) => {
  try {
    if (typeof window === 'undefined') return;

    // Collect minimal browser and device info with consent
    const analyticsData = {
      path: window.location.pathname,
      referrer: document.referrer,
      device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      browser: navigator.userAgent.split(' ')[0],
      session_id: sessionStorage.getItem('session_id') || Math.random().toString(36).substring(7),
      ...data
    };

    await fetch('/functions/v1/ingest-analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analyticsData),
    });
  } catch (error) {
    console.warn('Failed to send analytics to server:', error);
  }
};

// Extend window interface for TypeScript
declare global {
  interface Window {
    cookieConsent?: {
      necessary: boolean;
      analytics: boolean;
      marketing: boolean;
    };
  }
}
