'use client'

import { useState, useMemo } from 'react'
import { TourStats } from '@/components/TourStats'
import { SongChart } from '@/components/SongChart'
import { SongTable } from '@/components/SongTable'
import { FilterControls } from '@/components/FilterControls'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { PerformanceDashboard } from '@/components/PerformanceDashboard'
import { phishApi } from '@/lib/phishApi'
import { Song, Show, FilterOptions } from '@/types/phish'
import { useCachedDataSet, useCachedQuery } from '@/hooks/useCachedData'
import { performanceMonitor } from '@/lib/cache'

export default function Home() {
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'timesPlayed',
    sortOrder: 'desc',
    minLength: 0,
    maxLength: 60,
    searchTerm: ''
  })

  // Use cached data set for multiple API calls
  const { data, loading, errors, refresh } = useCachedDataSet<{
    shows: Show[]
    songs: Song[]
  }>([
    {
      key: 'shows',
      fetcher: () => phishApi.getRecentShows(),
      options: { 
        ttl: 6 * 60 * 60 * 1000, // 6 hours
        refreshInterval: 30 * 60 * 1000, // Check every 30 minutes
        onError: (error) => console.error('Error loading shows:', error)
      }
    },
    {
      key: 'songs',
      fetcher: () => phishApi.getSongStats(),
      options: { 
        ttl: 24 * 60 * 60 * 1000, // 24 hours
        refreshInterval: 60 * 60 * 1000, // Check every hour
        onError: (error) => console.error('Error loading songs:', error)
      }
    }
  ])

  const shows = data.shows || []
  const songs = data.songs || []

  // Use cached query for expensive filtering and sorting operations
  const filteredSongs = useCachedQuery(
    'filtered-songs',
    (filterParams: FilterOptions) => {
      return performanceMonitor.measure('filter-songs', () => {
        return songs.filter(song => {
          // Search filter
          if (filterParams.searchTerm && 
              !song.name.toLowerCase().includes(filterParams.searchTerm.toLowerCase())) {
            return false
          }
          
          // Length filter
          if (song.averageLength < filterParams.minLength || 
              song.averageLength > filterParams.maxLength) {
            return false
          }
          
          return true
        }).sort((a, b) => {
          const multiplier = filterParams.sortOrder === 'asc' ? 1 : -1
          switch (filterParams.sortBy) {
            case 'timesPlayed':
              return (a.timesPlayed - b.timesPlayed) * multiplier
            case 'averageLength':
              return (a.averageLength - b.averageLength) * multiplier
            case 'name':
              return a.name.localeCompare(b.name) * multiplier
            default:
              return 0
          }
        })
      })
    },
    filters,
    { ttl: 5 * 60 * 1000 } // Cache for 5 minutes
  )

  // Memoize chart data to avoid unnecessary re-renders
  const chartData = useMemo(() => {
    return {
      topByPlays: filteredSongs.slice(0, 20),
      topByLength: filteredSongs.slice(0, 20)
    }
  }, [filteredSongs])

  // Handle refresh
  const handleRefresh = async () => {
    await refresh()
  }

  if (loading) return <LoadingSpinner />
  
  if (Object.keys(errors).length > 0) {
    return (
      <div className="text-center text-red-600 p-8">
        <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
        {Object.entries(errors).map(([key, error]) => (
          <p key={key}>{key}: {error.message}</p>
        ))}
        <button 
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-gray-900">
            Phish Statistics Dashboard
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Explore song statistics, tour data, and performance analytics
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Tour Statistics Overview */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Current Summer Tour Overview
            </h2>
            <TourStats shows={shows} songs={songs} />
          </section>

          {/* Filters */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Song Analytics
            </h2>
            <FilterControls filters={filters} onFiltersChange={setFilters} />
          </section>

          {/* Charts */}
          <section className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Songs by Play Count</h3>
              <SongChart songs={chartData.topByPlays} type="timesPlayed" />
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Songs by Average Length</h3>
              <SongChart songs={chartData.topByLength} type="averageLength" />
            </div>
          </section>

          {/* Song Table */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Detailed Song Statistics
            </h3>
            <SongTable songs={filteredSongs} />
          </section>
        </div>
      </main>

      {/* Performance Dashboard */}
      <PerformanceDashboard />
    </div>
  )
}
