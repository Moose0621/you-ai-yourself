import { useCallback } from 'react'
import { trackEvent, trackError, trackMetric, trackDependency } from '@/lib/appInsights'

export interface UserAction {
  action: 'search' | 'filter' | 'view_tour' | 'click_song' | 'export_data' | 'sort_change'
  properties?: {
    query?: string
    filterType?: string
    songName?: string
    tourYear?: number
    resultCount?: number
    sortBy?: string
    sortOrder?: string
    minLength?: number
    maxLength?: number
  }
  timing?: number
}

export interface PerformanceMetrics {
  pageLoadTime: number
  apiResponseTime: number
  searchResponseTime: number
  filterOperationTime: number
  memoryUsage?: number
  cacheHitRate?: number
}

export function useTelemetry() {
  const trackUserAction = useCallback((action: UserAction) => {
    trackEvent(action.action, {
      ...action.properties,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    }, action.timing ? { timing: action.timing } : undefined)
  }, [])

  const trackErrorWithContext = useCallback((error: Error, context?: {
    userId?: string
    sessionId?: string
    action?: string
    dataSize?: number
  }) => {
    trackError(error, {
      ...context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    })
  }, [])

  const trackPerformanceMetric = useCallback((metric: keyof PerformanceMetrics, value: number, properties?: Record<string, any>) => {
    trackMetric(`performance.${metric}`, value, properties)
  }, [])

  const trackApiCall = useCallback((endpoint: string, method: string, responseTime: number, success: boolean, statusCode?: number) => {
    trackDependency(
      endpoint,
      `${method} ${endpoint}`,
      responseTime,
      success,
      {
        statusCode: statusCode?.toString(),
        timestamp: new Date().toISOString()
      }
    )
  }, [])

  const trackBusinessMetric = useCallback((metric: string, value: number | string, properties?: Record<string, any>) => {
    if (typeof value === 'number') {
      trackMetric(`business.${metric}`, value, properties)
    } else {
      trackEvent(`business.${metric}`, { value, ...properties })
    }
  }, [])

  return {
    trackUserAction,
    trackErrorWithContext,
    trackPerformanceMetric,
    trackApiCall,
    trackBusinessMetric
  }
}