import { useState, useEffect } from 'react';

interface AnalyticsEvent {
  id: string;
  event: string;
  page: string;
  timestamp: Date;
  userAgent: string;
  sessionId: string;
}

interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
}

export const useAnalytics = () => {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);

  // Generate session ID
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('analytics_session');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session', sessionId);
    }
    return sessionId;
  };

  // Track events
  const track = (event: string, page?: string) => {
    const analyticsEvent: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event,
      page: page || window.location.pathname,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      sessionId: getSessionId(),
    };

    setEvents(prev => [...prev, analyticsEvent]);
    
    // Store in localStorage for persistence
    const storedEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    localStorage.setItem('analytics_events', JSON.stringify([...storedEvents, analyticsEvent]));
  };

  // Track page views
  const trackPageView = (page: string) => {
    track('page_view', page);
  };

  // Get performance metrics
  const measurePerformance = () => {
    if ('performance' in window) {
      const navigation = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = window.performance.getEntriesByType('paint');
      
      const metrics: PerformanceMetrics = {
        pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: 0,
      };

      // Get LCP
      if ('PerformanceObserver' in window) {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          metrics.largestContentfulPaint = lastEntry.startTime;
          setPerformance(metrics);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      }

      setPerformance(metrics);
    }
  };

  // Load stored events on mount
  useEffect(() => {
    const storedEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    setEvents(storedEvents);
    measurePerformance();
  }, []);

  // Track page views on route changes
  useEffect(() => {
    trackPageView(window.location.pathname);
  }, [window.location.pathname]);

  return {
    events,
    performance,
    track,
    trackPageView,
    measurePerformance,
  };
};