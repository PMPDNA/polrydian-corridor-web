// Analytics utility functions with error handling and privacy compliance

interface AnalyticsEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

export const trackEvent = ({ 
  action, 
  category = 'engagement', 
  label, 
  value, 
  custom_parameters 
}: AnalyticsEvent) => {
  try {
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

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', { action, category, label, value, custom_parameters });
    }
  } catch (error) {
    console.warn('Analytics tracking error:', error);
  }
};

export const trackPageView = (page_title: string, page_location: string) => {
  try {
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('config', process.env.VITE_GA_MEASUREMENT_ID || 'GA_MEASUREMENT_ID', {
        page_title,
        page_location,
        send_page_view: true
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Page View:', { page_title, page_location });
    }
  } catch (error) {
    console.warn('Page view tracking error:', error);
  }
};

export const trackPerformance = (metric: string, value: number, unit: string = 'ms') => {
  try {
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'timing_complete', {
        name: metric,
        value: value,
        event_category: 'performance',
        custom_map: { metric_unit: unit }
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Metric:', { metric, value, unit });
    }
  } catch (error) {
    console.warn('Performance tracking error:', error);
  }
};

export const trackConversion = (conversion_id: string, value?: number, currency: string = 'USD') => {
  try {
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