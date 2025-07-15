/**
 * Simple in-memory cache with TTL and LRU eviction
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
}

interface CacheStats {
  hits: number
  misses: number
  evictions: number
  totalRequests: number
}

export class MemoryCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>()
  private maxSize: number
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalRequests: 0
  }

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize
  }

  set(key: string, data: T, ttl: number = 24 * 60 * 60 * 1000): void {
    // Remove expired entries and enforce size limit
    this.cleanup()
    
    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }

    const now = Date.now()
    this.cache.set(key, {
      data,
      timestamp: now,
      ttl,
      accessCount: 0,
      lastAccessed: now
    })
  }

  get(key: string): T | null {
    this.stats.totalRequests++
    
    const entry = this.cache.get(key)
    if (!entry) {
      this.stats.misses++
      return null
    }

    const now = Date.now()
    
    // Check if expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    // Update access statistics
    entry.accessCount++
    entry.lastAccessed = now
    
    this.stats.hits++
    return entry.data
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0
    }
  }

  invalidatePattern(pattern: string): number {
    const regex = new RegExp(pattern)
    let deleted = 0
    
    Array.from(this.cache.keys()).forEach(key => {
      if (regex.test(key)) {
        this.cache.delete(key)
        deleted++
      }
    })
    
    return deleted
  }

  getStats(): CacheStats & { size: number; hitRate: number } {
    const hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests) * 100 
      : 0

    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: Number(hitRate.toFixed(2))
    }
  }

  private cleanup(): void {
    const now = Date.now()
    
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        this.stats.evictions++
      }
    })
  }

  private evictLRU(): void {
    let oldestKey = ''
    let oldestTime = Infinity
    
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    })
    
    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.stats.evictions++
    }
  }
}

// Global cache instances
export const apiCache = new MemoryCache(50) // For API responses
export const queryCache = new MemoryCache(100) // For filtered query results

// Cache key generators
export const generateCacheKey = {
  apiCall: (endpoint: string, params?: Record<string, any>) => {
    const paramStr = params ? JSON.stringify(params) : ''
    return `api:${endpoint}${paramStr ? `:${paramStr}` : ''}`
  },
  
  query: (type: string, filters: Record<string, any>) => {
    const filterStr = JSON.stringify(filters)
    return `query:${type}:${filterStr}`
  },
  
  search: (query: string, type: string) => {
    return `search:${type}:${query.toLowerCase()}`
  }
}

// Performance monitoring
export const performanceMonitor = {
  timers: new Map<string, number>(),
  
  start(label: string): void {
    this.timers.set(label, performance.now())
  },
  
  end(label: string): number {
    const startTime = this.timers.get(label)
    if (!startTime) return 0
    
    const duration = performance.now() - startTime
    this.timers.delete(label)
    
    // Log slow operations (> 100ms)
    if (duration > 100) {
      console.warn(`Slow operation detected: ${label} took ${duration.toFixed(2)}ms`)
    }
    
    return duration
  },
  
  measure<T>(label: string, fn: () => T): T {
    this.start(label)
    const result = fn()
    this.end(label)
    return result
  },
  
  async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label)
    const result = await fn()
    this.end(label)
    return result
  }
}