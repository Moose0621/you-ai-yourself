import { ApplicationInsights } from '@microsoft/applicationinsights-web';

// Initialize Application Insights
let appInsights: ApplicationInsights | null = null;

export function initializeAppInsights(): ApplicationInsights | null {
  // Only initialize on client side
  if (typeof window === 'undefined') {
    return null;
  }

  // Return existing instance if already initialized
  if (appInsights) {
    return appInsights;
  }

  const connectionString = process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING;
  
  // Only initialize if connection string is provided
  if (!connectionString) {
    console.warn('Azure Application Insights connection string not found. Monitoring disabled.');
    return null;
  }

  try {
    appInsights = new ApplicationInsights({
      config: {
        connectionString,
        enableAutoRouteTracking: true,
        enableRequestHeaderTracking: true,
        enableResponseHeaderTracking: true,
        enableCorsCorrelation: true,
        disableFetchTracking: false,
        disableAjaxTracking: false,
        autoTrackPageVisitTime: true,
        enableUnhandledPromiseRejectionTracking: true,
      }
    });

    appInsights.loadAppInsights();
    appInsights.trackPageView();

    console.log('Azure Application Insights initialized successfully');
    return appInsights;
  } catch (error) {
    console.error('Failed to initialize Azure Application Insights:', error);
    return null;
  }
}

export function getAppInsights(): ApplicationInsights | null {
  return appInsights;
}

// Helper functions for common telemetry operations
export function trackEvent(name: string, properties?: Record<string, any>, measurements?: Record<string, number>) {
  const ai = getAppInsights();
  if (ai) {
    ai.trackEvent({ name, properties, measurements });
  }
}

export function trackError(error: Error, properties?: Record<string, any>) {
  const ai = getAppInsights();
  if (ai) {
    ai.trackException({ 
      exception: error, 
      properties: {
        ...properties,
        timestamp: new Date().toISOString()
      }
    });
  }
}

export function trackMetric(name: string, value: number, properties?: Record<string, any>) {
  const ai = getAppInsights();
  if (ai) {
    ai.trackMetric({ name, average: value }, properties);
  }
}

export function trackPageView(name?: string, url?: string, properties?: Record<string, any>) {
  const ai = getAppInsights();
  if (ai) {
    ai.trackPageView({ name, uri: url, properties });
  }
}

export function trackDependency(
  name: string,
  data: string,
  duration: number,
  success: boolean,
  properties?: Record<string, any>
) {
  const ai = getAppInsights();
  if (ai) {
    ai.trackDependencyData({
      id: `${name}-${Date.now()}`,
      name,
      data,
      duration,
      success,
      responseCode: success ? 200 : 500,
      properties
    });
  }
}