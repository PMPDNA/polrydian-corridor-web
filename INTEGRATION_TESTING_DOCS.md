# Integration Testing Documentation

## Overview
This document outlines the integration testing approach for the Polrydian Corridor Web application's advanced features including search, real-time updates, offline support, and performance monitoring.

## Test Coverage

### 1. Advanced Search Features
- **Basic Search**: Tests full-text search across articles
- **Advanced Filters**: Tests category, date range, and status filtering
- **Search Analytics**: Verifies query tracking and analytics collection
- **Relevance Scoring**: Ensures proper result ranking

### 2. Real-time Features
- **WebSocket Connection**: Tests Supabase real-time connection
- **Table Subscriptions**: Verifies real-time data updates
- **Update Queue**: Tests proper handling of real-time events
- **Connection Recovery**: Tests reconnection on network issues

### 3. Offline Support
- **Network Detection**: Tests online/offline status detection
- **Data Caching**: Verifies local data storage and retrieval
- **Cache Synchronization**: Tests sync when coming back online
- **Fallback Behavior**: Ensures graceful degradation

### 4. Performance Monitoring
- **Core Web Vitals**: Tracks LCP, FID, CLS, FCP, TTFB
- **Custom Metrics**: Monitors render count, memory usage, bundle size
- **Bundle Analysis**: Identifies optimization opportunities
- **Mobile Optimizations**: Tests mobile-specific features

## Test Implementation

### Running Tests
The integration test suite can be accessed via:
- **Admin Dashboard**: `/admin/performance` → Integration Test Results section
- **Standalone Component**: `<IntegrationTestSuite />` can be used in any admin page

### Test Structure
```typescript
interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
  details?: string;
}
```

### Individual Test Cases

#### Search Tests
```typescript
// Basic search functionality
const basicResults = await performSearch('corridor economics');
// Should return relevant articles with proper scoring

// Advanced filtering
const filteredResults = await performSearch('analysis', {
  status: 'published',
  dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
});
// Should filter results by status and date
```

#### Real-time Tests
```typescript
// Connection test
if (!isConnected) {
  throw new Error('Real-time connection not established');
}

// Subscription test
const unsubscribe = subscribeToTable('articles', (update) => {
  console.log('Received update:', update);
});
```

#### Offline Tests
```typescript
// Cache test
await cacheData('test-key', { test: 'data' });
// Should store data locally

// Network status
const status = isOnline ? 'Online' : 'Offline';
// Should accurately detect network status
```

## Performance Metrics

### Core Web Vitals Targets
- **LCP**: < 2.5s (Good), < 4.0s (Needs Improvement)
- **FID**: < 100ms (Good), < 300ms (Needs Improvement)  
- **CLS**: < 0.1 (Good), < 0.25 (Needs Improvement)

### Custom Metrics
- **Memory Usage**: Monitor JS heap size
- **Bundle Size**: Track total JavaScript size
- **Render Count**: Optimize unnecessary re-renders

## Mobile Optimizations

### Automatic Optimizations
- **Low Battery**: Pause real-time updates when battery < 20%
- **Slow Connection**: Enable data saver mode on 2G networks
- **Data Saver**: Respect user's data saver preferences

### Manual Controls
- **Pause/Resume**: Users can manually control real-time updates
- **Cache Management**: Clear cached data to free storage
- **Connection Info**: Display network type and speed

## Troubleshooting

### Common Issues
1. **Search Not Working**: Check Supabase connection and table permissions
2. **Real-time Failed**: Verify WebSocket connection and Supabase config
3. **Offline Issues**: Check localStorage availability and quotas
4. **Performance Problems**: Monitor Core Web Vitals and bundle size

### Debug Information
- Check browser console for detailed error messages
- Use Network tab to verify API calls
- Monitor Performance tab for Core Web Vitals
- Check Application tab for cached data

## Best Practices

### Search Optimization
- Use appropriate database indexes
- Implement proper pagination
- Cache frequent queries
- Optimize relevance scoring

### Real-time Efficiency
- Limit subscription scope
- Handle connection drops gracefully
- Implement proper cleanup
- Use selective updates

### Offline Strategy
- Cache critical data only
- Implement proper cache invalidation
- Handle storage quota limits
- Provide clear offline indicators

### Performance Monitoring
- Track metrics continuously
- Set up alerts for degradation
- Regular bundle analysis
- Monitor mobile performance

## API Integration

### Search Analytics Integration
The search analytics hook integrates with the existing analytics system:
```typescript
// Track search queries
await trackSearch(query, resultsCount, searchTime, filters);

// Track result clicks
await trackResultClick(query, resultId, resultTitle);

// Get search insights
const suggestions = getSearchSuggestions(inputText);
```

### Database Tables
Ensure these tables exist for full functionality:
- `articles` - For search content
- `search_queries` - For analytics (optional)
- Enable RLS policies for security

## Monitoring Dashboard

The performance dashboard provides:
- Real-time system status
- Integration health checks
- Performance metrics visualization
- Mobile optimization controls
- Quick troubleshooting actions

Access via: `/admin/performance`