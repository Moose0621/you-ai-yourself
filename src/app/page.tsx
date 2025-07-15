'use client'

import { useState, useEffect } from 'react'
import { TourStats } from '@/components/TourStats'
import { SongChart } from '@/components/SongChart'
import { SongTable } from '@/components/SongTable'
import { FilterControls } from '@/components/FilterControls'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { phishApi } from '@/lib/phishApi'
import { Song, Show, FilterOptions } from '@/types/phish'

export default function Home() {
  const [shows, setShows] = useState<Show[]>([])
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'timesPlayed',
    sortOrder: 'desc',
    minLength: 0,
    maxLength: 60,
    searchTerm: ''
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        // For now, we'll load recent shows data
        // You can later add your API key as an environment variable
        const showsData = await phishApi.getRecentShows()
        const songsData = await phishApi.getSongStats()
        
        setShows(showsData)
        setSongs(songsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredSongs = songs.filter(song => {
    if (filters.searchTerm && !song.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false
    }
    if (song.averageLength < filters.minLength || song.averageLength > filters.maxLength) {
      return false
    }
    return true
  }).sort((a, b) => {
    const multiplier = filters.sortOrder === 'asc' ? 1 : -1
    switch (filters.sortBy) {
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

  if (loading) return <LoadingSpinner />
  if (error) return <div className="text-center text-red-600 p-8">Error: {error}</div>

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
              <SongChart songs={filteredSongs.slice(0, 20)} type="timesPlayed" />
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Songs by Average Length</h3>
              <SongChart songs={filteredSongs.slice(0, 20)} type="averageLength" />
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
    </div>
  )
}
