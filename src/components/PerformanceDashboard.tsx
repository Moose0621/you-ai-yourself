import { useState, useEffect } from 'react'
import { apiCache, queryCache } from '@/lib/cache'
import { phishApi } from '@/lib/phishApi'

interface PerformanceDashboardProps {
  className?: string
}

export function PerformanceDashboard({ className = '' }: PerformanceDashboardProps) {
  const [stats, setStats] = useState({
    apiCache: apiCache.getStats(),
    queryCache: queryCache.getStats(),
    memoryUsage: 0
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateStats = () => {
      // Use type assertion for performance.memory which exists in some browsers
      const perfMemory = (performance as any).memory
      
      setStats({
        apiCache: apiCache.getStats(),
        queryCache: queryCache.getStats(),
        memoryUsage: perfMemory?.usedJSHeapSize || 0
      })
    }

    // Update stats every 5 seconds
    const interval = setInterval(updateStats, 5000)
    updateStats() // Initial update

    return () => clearInterval(interval)
  }, [])

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const clearCaches = () => {
    apiCache.clear()
    queryCache.clear()
    const perfMemory = (performance as any).memory
    setStats({
      apiCache: apiCache.getStats(),
      queryCache: queryCache.getStats(),
      memoryUsage: perfMemory?.usedJSHeapSize || 0
    })
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className={`fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors ${className}`}
        title="Show Performance Stats"
      >
        📊 Cache Stats
      </button>
    )
  }

  return (
    <div className={`fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Performance Dashboard</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3 text-xs">
        {/* API Cache Stats */}
        <div className="border-b border-gray-100 pb-2">
          <h4 className="font-medium text-gray-700 mb-1">API Cache</h4>
          <div className="grid grid-cols-2 gap-2 text-gray-600">
            <div>Size: {stats.apiCache.size}</div>
            <div>Hit Rate: {stats.apiCache.hitRate}%</div>
            <div>Hits: {stats.apiCache.hits}</div>
            <div>Misses: {stats.apiCache.misses}</div>
          </div>
        </div>

        {/* Query Cache Stats */}
        <div className="border-b border-gray-100 pb-2">
          <h4 className="font-medium text-gray-700 mb-1">Query Cache</h4>
          <div className="grid grid-cols-2 gap-2 text-gray-600">
            <div>Size: {stats.queryCache.size}</div>
            <div>Hit Rate: {stats.queryCache.hitRate}%</div>
            <div>Hits: {stats.queryCache.hits}</div>
            <div>Misses: {stats.queryCache.misses}</div>
          </div>
        </div>

        {/* Memory Usage */}
        {stats.memoryUsage > 0 && (
          <div className="border-b border-gray-100 pb-2">
            <h4 className="font-medium text-gray-700 mb-1">Memory</h4>
            <div className="text-gray-600">
              Used: {formatBytes(stats.memoryUsage)}
            </div>
          </div>
        )}

        {/* Performance Indicators */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Cache Performance:</span>
            <span className={`font-medium ${stats.apiCache.hitRate >= 80 ? 'text-green-600' : stats.apiCache.hitRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {stats.apiCache.hitRate >= 80 ? 'Excellent' : stats.apiCache.hitRate >= 60 ? 'Good' : 'Poor'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 space-y-2">
          <button
            onClick={clearCaches}
            className="w-full bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors"
          >
            Clear All Caches
          </button>
          <button
            onClick={() => {
              const cacheStats = phishApi.getCacheStats()
              console.log('Cache Statistics:', {
                api: stats.apiCache,
                query: stats.queryCache,
                phishApi: cacheStats
              })
            }}
            className="w-full bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
          >
            Log Detailed Stats
          </button>
        </div>
      </div>
    </div>
  )
}