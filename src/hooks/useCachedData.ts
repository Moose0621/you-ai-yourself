import { useState, useEffect, useCallback, useRef } from 'react'
import { apiCache, generateCacheKey, performanceMonitor } from '@/lib/cache'

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  refreshInterval?: number // Auto-refresh interval in milliseconds
  staleWhileRevalidate?: boolean // Return stale data while fetching fresh data
  onError?: (error: Error) => void
}

interface CacheState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  lastUpdated: number | null
  isStale: boolean
}

export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): CacheState<T> & {
  refresh: () => Promise<void>
  invalidate: () => void
} {
  const {
    ttl = 24 * 60 * 60 * 1000, // 24 hours default
    refreshInterval,
    staleWhileRevalidate = true,
    onError
  } = options

  const [state, setState] = useState<CacheState<T>>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null,
    isStale: false
  })

  const fetcherRef = useRef(fetcher)
  const refreshTimeoutRef = useRef<NodeJS.Timeout>()
  
  // Update fetcher ref when it changes
  useEffect(() => {
    fetcherRef.current = fetcher
  }, [fetcher])

  const fetchData = useCallback(async (useCache = true): Promise<void> => {
    try {
      // Check cache first if enabled
      if (useCache) {
        const cached = apiCache.get(key)
        if (cached) {
          setState(prev => ({
            ...prev,
            data: cached,
            loading: false,
            error: null,
            lastUpdated: Date.now(),
            isStale: false
          }))
          return
        }
      }

      // Set loading state if no cached data
      setState(prev => ({
        ...prev,
        loading: prev.data === null, // Don't show loading if we have stale data
        error: null
      }))

      // Fetch fresh data
      const result = await performanceMonitor.measureAsync(
        `fetch:${key}`,
        () => fetcherRef.current()
      )

      // Cache the result
      apiCache.set(key, result, ttl)

      setState({
        data: result,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
        isStale: false
      })

    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error')
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: err
      }))
      
      if (onError) {
        onError(err)
      }
    }
  }, [key, ttl, onError])

  const refresh = useCallback(async (): Promise<void> => {
    return fetchData(false) // Force fresh fetch
  }, [fetchData])

  const invalidate = useCallback((): void => {
    apiCache.delete(key)
    setState(prev => ({
      ...prev,
      isStale: true
    }))
  }, [key])

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Set up auto-refresh interval
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      refreshTimeoutRef.current = setInterval(() => {
        // Check if data is stale first
        const cached = apiCache.get(key)
        if (!cached && staleWhileRevalidate) {
          // Data is stale, mark as such and fetch in background
          setState(prev => ({
            ...prev,
            isStale: true
          }))
          fetchData(false)
        }
      }, refreshInterval)

      return () => {
        if (refreshTimeoutRef.current) {
          clearInterval(refreshTimeoutRef.current)
        }
      }
    }
  }, [refreshInterval, key, staleWhileRevalidate, fetchData])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current)
      }
    }
  }, [])

  return {
    ...state,
    refresh,
    invalidate
  }
}

// Hook for caching expensive computations (like filtering/sorting)
export function useCachedQuery<T, P>(
  queryKey: string,
  queryFn: (params: P) => T,
  params: P,
  options: { ttl?: number } = {}
): T {
  const { ttl = 5 * 60 * 1000 } = options // 5 minutes default for queries
  
  const [result, setResult] = useState<T>(() => {
    // Try to get from cache first
    const cacheKey = generateCacheKey.query(queryKey, params as Record<string, any>)
    const cached = apiCache.get(cacheKey)
    if (cached) {
      return cached
    }
    
    // Compute and cache
    const computed = performanceMonitor.measure(
      `query:${queryKey}`,
      () => queryFn(params)
    )
    apiCache.set(cacheKey, computed, ttl)
    return computed
  })

  useEffect(() => {
    const cacheKey = generateCacheKey.query(queryKey, params as Record<string, any>)
    const cached = apiCache.get(cacheKey)
    
    if (cached) {
      setResult(cached)
    } else {
      const computed = performanceMonitor.measure(
        `query:${queryKey}`,
        () => queryFn(params)
      )
      apiCache.set(cacheKey, computed, ttl)
      setResult(computed)
    }
  }, [queryKey, params, queryFn, ttl])

  return result
}

// Hook for managing multiple cached datasets
export function useCachedDataSet<T extends Record<string, any>>(
  configs: Array<{
    key: string
    fetcher: () => Promise<T[keyof T]>
    options?: CacheOptions
  }>
): {
  data: Partial<T>
  loading: boolean
  errors: Record<string, Error>
  refresh: (key?: string) => Promise<void>
  invalidate: (key?: string) => void
} {
  const [data, setData] = useState<Partial<T>>({})
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, Error>>({})

  const cachedResults = configs.map(config => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useCachedData(config.key, config.fetcher, config.options)
  })

  useEffect(() => {
    const newData: Partial<T> = {}
    const newErrors: Record<string, Error> = {}
    let isLoading = false

    configs.forEach((config, index) => {
      const result = cachedResults[index]
      if (result.data !== null) {
        newData[config.key as keyof T] = result.data
      }
      if (result.error) {
        newErrors[config.key] = result.error
      }
      if (result.loading) {
        isLoading = true
      }
    })

    setData(newData)
    setErrors(newErrors)
    setLoading(isLoading)
  }, [cachedResults, configs])

  const refresh = useCallback(async (key?: string): Promise<void> => {
    if (key) {
      const index = configs.findIndex(config => config.key === key)
      if (index >= 0) {
        await cachedResults[index].refresh()
      }
    } else {
      await Promise.all(cachedResults.map(result => result.refresh()))
    }
  }, [configs, cachedResults])

  const invalidate = useCallback((key?: string): void => {
    if (key) {
      const index = configs.findIndex(config => config.key === key)
      if (index >= 0) {
        cachedResults[index].invalidate()
      }
    } else {
      cachedResults.forEach(result => result.invalidate())
    }
  }, [configs, cachedResults])

  return {
    data,
    loading,
    errors,
    refresh,
    invalidate
  }
}