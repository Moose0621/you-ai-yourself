# Issue #4: Integrate Azure Application Insights for Monitoring

## **Problem Statement**
The application currently lacks comprehensive monitoring, observability, and performance tracking in production. Without detailed insights into user behavior, performance bottlenecks, and system health, it's difficult to maintain optimal performance and user experience.

## **Current Monitoring Gaps**
- No real-time performance monitoring
- Missing user behavior analytics
- No error tracking or alerting
- Limited visibility into API performance
- No custom business metrics tracking
- Absence of dependency tracking
- No availability monitoring

## **Proposed Solution**
Implement Azure Application Insights to provide comprehensive monitoring, analytics, and alerting capabilities for the Phish Statistics Dashboard, enabling data-driven optimization and proactive issue resolution.

## **Use Cases**

### UC1: Real-Time Performance Monitoring
**As a site administrator**, I want to monitor application performance in real-time
**So that** I can quickly identify and resolve performance issues

**Implementation:**
- Page load time tracking across all routes
- API response time monitoring
- JavaScript error detection and alerting
- Browser performance metrics collection
- Mobile vs desktop performance comparison

### UC2: User Behavior Analytics
**As a product manager**, I want to understand how users interact with the application
**So that** I can make data-driven decisions about feature development

**Implementation:**
- User journey tracking through the application
- Feature usage analytics (Tours vs Statistics tabs)
- Search query analysis and patterns
- Chart interaction heatmaps
- Session duration and bounce rate tracking

### UC3: Business Intelligence Dashboard
**As a stakeholder**, I want insights into application usage and engagement
**So that** I can understand the value and impact of the platform

**Implementation:**
- Custom metrics for Phish-specific interactions
- Popular songs and tours analytics
- Geographic distribution of users
- Peak usage times and patterns
- Content engagement metrics

### UC4: Proactive Error Management
**As a developer**, I want to be notified of errors before users report them
**So that** I can maintain high application reliability

**Implementation:**
- Automatic error capture and categorization
- Smart alerting for critical issues
- Error trend analysis and reporting
- Performance regression detection
- Dependency failure monitoring

### UC5: Infrastructure Health Monitoring
**As a DevOps engineer**, I want comprehensive infrastructure monitoring
**So that** I can ensure optimal system performance and availability

**Implementation:**
- Azure Web App health monitoring
- Database performance tracking
- CDN performance and cache hit rates
- Background job monitoring
- Resource utilization tracking

## **Technical Implementation**

### Phase 1: Basic Application Insights Setup
```typescript
// Application Insights initialization
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

const reactPlugin = new ReactPlugin();
const appInsights = new ApplicationInsights({
  config: {
    instrumentationKey: process.env.NEXT_PUBLIC_APP_INSIGHTS_KEY,
    extensions: [reactPlugin],
    extensionConfig: {
      [reactPlugin.identifier]: { history: router }
    },
    enableAutoRouteTracking: true,
    enableCorsCorrelation: true,
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true,
    enableAjaxErrorStatusText: true,
    enableAjaxPerfTracking: true,
    maxAjaxCallsPerView: 20,
    disableAjaxTracking: false,
    disableFetchTracking: false,
    enableUnhandledPromiseRejectionTracking: true
  }
});

appInsights.loadAppInsights();
export { appInsights, reactPlugin };
```

### Phase 2: Custom Event Tracking
```typescript
// Custom events for Phish-specific interactions
class PhishAnalytics {
  static trackSongSearch(query: string, resultCount: number) {
    appInsights.trackEvent({
      name: 'SongSearch',
      properties: {
        query: query.toLowerCase(),
        resultCount,
        queryLength: query.length,
        hasResults: resultCount > 0
      },
      measurements: {
        searchResponseTime: performance.now()
      }
    });
  }

  static trackChartInteraction(chartType: string, interactionType: string) {
    appInsights.trackEvent({
      name: 'ChartInteraction',
      properties: {
        chartType,
        interactionType, // hover, click, filter, zoom
        timestamp: new Date().toISOString()
      }
    });
  }

  static trackTourExploration(year: number, tourId: string) {
    appInsights.trackEvent({
      name: 'TourExploration',
      properties: {
        year,
        tourId,
        explorationDepth: 'detailed'
      }
    });
  }

  static trackSongDetail(songName: string, viewType: string) {
    appInsights.trackEvent({
      name: 'SongDetailView',
      properties: {
        songName,
        viewType, // jam-analysis, statistics, history
        userSegment: this.getUserSegment()
      }
    });
  }

  static trackDataLoad(dataType: string, loadTime: number, recordCount: number) {
    appInsights.trackEvent({
      name: 'DataLoad',
      properties: {
        dataType,
        success: true
      },
      measurements: {
        loadTime,
        recordCount,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
      }
    });
  }
}
```

### Phase 3: Performance Tracking
```typescript
// Performance monitoring utilities
class PerformanceTracker {
  private static performanceObserver: PerformanceObserver;

  static initializeTracking() {
    // Track Web Vitals
    this.trackWebVitals();
    
    // Track custom performance metrics
    this.trackDataProcessingTime();
    
    // Monitor memory usage
    this.trackMemoryUsage();
  }

  static trackWebVitals() {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS((metric) => {
        appInsights.trackMetric({
          name: 'CLS',
          average: metric.value,
          properties: { rating: metric.rating }
        });
      });

      getFID((metric) => {
        appInsights.trackMetric({
          name: 'FID',
          average: metric.value,
          properties: { rating: metric.rating }
        });
      });

      getFCP((metric) => {
        appInsights.trackMetric({
          name: 'FCP',
          average: metric.value,
          properties: { rating: metric.rating }
        });
      });

      getLCP((metric) => {
        appInsights.trackMetric({
          name: 'LCP',
          average: metric.value,
          properties: { rating: metric.rating }
        });
      });

      getTTFB((metric) => {
        appInsights.trackMetric({
          name: 'TTFB',
          average: metric.value,
          properties: { rating: metric.rating }
        });
      });
    });
  }

  static trackDataProcessingTime() {
    const originalGetSongStats = phishApi.getSongStats;
    phishApi.getSongStats = async (...args) => {
      const startTime = performance.now();
      try {
        const result = await originalGetSongStats.apply(phishApi, args);
        const duration = performance.now() - startTime;
        
        appInsights.trackMetric({
          name: 'DataProcessingTime',
          average: duration,
          properties: {
            operation: 'getSongStats',
            recordCount: result.length
          }
        });
        
        return result;
      } catch (error) {
        appInsights.trackException({
          exception: error as Error,
          properties: {
            operation: 'getSongStats',
            duration: performance.now() - startTime
          }
        });
        throw error;
      }
    };
  }
}
```

### Phase 4: Custom Dashboards and Alerts
```json
// Application Insights queries for custom dashboards
{
  "popularSongs": {
    "query": "customEvents | where name == 'SongDetailView' | summarize count() by tostring(customDimensions.songName) | order by count_ desc | take 20",
    "description": "Most viewed songs"
  },
  "searchPatterns": {
    "query": "customEvents | where name == 'SongSearch' | extend queryLength = strlen(tostring(customDimensions.query)) | summarize avg(queryLength), count() by bin(timestamp, 1h)",
    "description": "Search patterns over time"
  },
  "performanceByBrowser": {
    "query": "browserTimings | summarize avg(networkDuration), avg(processingDuration) by client_Browser | order by avg_networkDuration desc",
    "description": "Performance metrics by browser"
  },
  "errorRate": {
    "query": "requests | union exceptions | summarize errorRate = 100.0 * countif(success == false) / count() by bin(timestamp, 5m)",
    "description": "Error rate over time"
  },
  "userJourney": {
    "query": "pageViews | order by timestamp asc | extend sessionId = tostring(session_Id) | summarize journey = make_list(name) by sessionId | take 100",
    "description": "Common user journeys"
  }
}
```

## **Custom Metrics and KPIs**

### Application Performance KPIs
- **Page Load Time**: < 3 seconds (95th percentile)
- **API Response Time**: < 500ms (average)
- **Error Rate**: < 1% (rolling 24h)
- **Availability**: > 99.9% uptime
- **Memory Usage**: < 100MB steady state

### User Engagement KPIs
- **Session Duration**: Average time spent in application
- **Feature Adoption**: Usage rates for Tours vs Statistics
- **Search Success Rate**: Percentage of searches with results
- **Return User Rate**: Weekly/monthly active users
- **Content Engagement**: Most popular songs and tours

### Business Intelligence KPIs
- **Peak Usage Times**: When users are most active
- **Geographic Distribution**: Where users are located
- **Mobile vs Desktop**: Platform preferences
- **Data Freshness Impact**: How data updates affect usage
- **Performance Impact**: Correlation between speed and engagement

## **Monitoring and Alerting Setup**

### Critical Alerts (Immediate Response)
- Application availability drops below 99%
- Average response time exceeds 2 seconds
- Error rate exceeds 5% in 5-minute window
- Memory usage exceeds 200MB
- Dependency failures (API, database)

### Warning Alerts (Next Business Day)
- Performance degradation trends
- Unusual error patterns
- High user bounce rates
- Memory leaks detected
- Search failure rate increases

### Informational Alerts (Weekly Digest)
- Usage pattern changes
- Popular content shifts
- Performance improvements/regressions
- User behavior insights
- Feature adoption metrics

## **Implementation Tasks**

### Phase 1: Setup and Basic Tracking (1 week)
- [ ] **Task 4.1**: Configure Azure Application Insights resource
- [ ] **Task 4.2**: Install and configure Application Insights SDK
- [ ] **Task 4.3**: Set up basic page view and performance tracking
- [ ] **Task 4.4**: Configure error tracking and alerting

### Phase 2: Custom Events and Metrics (1 week)
- [ ] **Task 4.5**: Implement Phish-specific event tracking
- [ ] **Task 4.6**: Add performance metrics for data operations
- [ ] **Task 4.7**: Set up custom business intelligence metrics
- [ ] **Task 4.8**: Create user behavior tracking

### Phase 3: Dashboards and Analytics (1 week)
- [ ] **Task 4.9**: Build custom Application Insights dashboards
- [ ] **Task 4.10**: Configure automated alerts and notifications
- [ ] **Task 4.11**: Set up weekly/monthly reporting
- [ ] **Task 4.12**: Create performance optimization workflows

### Phase 4: Advanced Features (1 week)
- [ ] **Task 4.13**: Implement A/B testing framework
- [ ] **Task 4.14**: Add funnel analysis for user journeys
- [ ] **Task 4.15**: Set up dependency tracking for external APIs
- [ ] **Task 4.16**: Configure integration with Azure Monitor

## **Data Privacy and Compliance**

### Privacy Considerations
- No personally identifiable information (PII) collection
- Anonymized user session tracking
- GDPR-compliant data retention policies
- User consent for analytics tracking
- Data minimization principles

### Security Measures
- Secure instrumentation key management
- Encrypted data transmission
- Access control for monitoring dashboards
- Audit logging for data access
- Regular security reviews

## **Acceptance Criteria**

- [ ] Application Insights is fully configured and collecting data
- [ ] Custom events track all major user interactions
- [ ] Performance metrics meet or exceed industry standards
- [ ] Alerting system notifies team of critical issues within 5 minutes
- [ ] Custom dashboards provide actionable insights
- [ ] Error tracking captures and categorizes 95%+ of issues
- [ ] User behavior analytics identify optimization opportunities
- [ ] Business intelligence metrics support data-driven decisions
- [ ] Mobile and desktop performance is tracked separately
- [ ] Integration with Azure deployment pipeline is complete

## **Dependencies**
- Azure Application Insights resource provisioning
- Application Insights SDK and React plugin
- Web Vitals library for performance metrics
- Azure Monitor for advanced alerting
- Power BI or similar for advanced analytics dashboards

## **Estimated Effort**
**20-25 hours** (Medium complexity)

## **Priority**
**Medium-High** - Critical for production monitoring and optimization

## **Labels**
`monitoring`, `analytics`, `azure`, `observability`, `performance`, `devops`
