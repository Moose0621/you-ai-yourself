import { trackMetric } from '@/lib/appInsights'

/**
 * Performance tracking wrapper for functions
 * Automatically tracks execution time and reports it to Application Insights
 */
export function withPerformanceTracking<T extends (...args: any[]) => any>(
  fn: T,
  operationName: string
): T {
  return ((...args: any[]) => {
    const start = performance.now()
    const result = fn(...args)
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = performance.now() - start
        trackMetric(`performance.${operationName}`, duration, {
          timestamp: new Date().toISOString(),
          operationType: 'async'
        })
      })
    } else {
      const duration = performance.now() - start
      trackMetric(`performance.${operationName}`, duration, {
        timestamp: new Date().toISOString(),
        operationType: 'sync'
      })
      return result
    }
  }) as T
}

/**
 * Measure and track the execution time of a function call
 */
export async function measurePerformance<T>(
  operationName: string,
  operation: () => Promise<T> | T,
  properties?: Record<string, any>
): Promise<T> {
  const start = performance.now()
  
  try {
    const result = await operation()
    const duration = performance.now() - start
    
    trackMetric(`performance.${operationName}`, duration, {
      ...properties,
      timestamp: new Date().toISOString(),
      success: true
    })
    
    return result
  } catch (error) {
    const duration = performance.now() - start
    
    trackMetric(`performance.${operationName}`, duration, {
      ...properties,
      timestamp: new Date().toISOString(),
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    throw error
  }
}

/**
 * Track custom performance metrics with context
 */
export function trackCustomMetric(
  metricName: string,
  value: number,
  category?: string,
  properties?: Record<string, any>
) {
  const fullName = category ? `${category}.${metricName}` : metricName
  
  trackMetric(fullName, value, {
    ...properties,
    timestamp: new Date().toISOString(),
    category
  })
}

/**
 * Performance monitoring class for tracking user journey
 */
export class PerformanceTracker {
  private startTimes: Map<string, number> = new Map()
  private operations: Map<string, { count: number; totalTime: number }> = new Map()

  start(operationName: string): void {
    this.startTimes.set(operationName, performance.now())
  }

  end(operationName: string, properties?: Record<string, any>): number | null {
    const startTime = this.startTimes.get(operationName)
    if (!startTime) {
      console.warn(`No start time found for operation: ${operationName}`)
      return null
    }

    const duration = performance.now() - startTime
    this.startTimes.delete(operationName)

    // Track the metric
    trackMetric(`performance.${operationName}`, duration, {
      ...properties,
      timestamp: new Date().toISOString()
    })

    // Update aggregate statistics
    const current = this.operations.get(operationName) || { count: 0, totalTime: 0 }
    current.count++
    current.totalTime += duration
    this.operations.set(operationName, current)

    return duration
  }

  getAverageTime(operationName: string): number | null {
    const stats = this.operations.get(operationName)
    return stats ? stats.totalTime / stats.count : null
  }

  reset(): void {
    this.startTimes.clear()
    this.operations.clear()
  }
}

// Global performance tracker instance
export const globalPerformanceTracker = new PerformanceTracker()