'use client'

import { useState, useEffect } from 'react'
import { TourStats } from '@/components/TourStats'
import { SongChart } from '@/components/SongChart'
import { SongTable } from '@/components/SongTable'
import { FilterControls } from '@/components/FilterControls'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { phishApi } from '@/lib/simpleLocalPhishApi'
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
        setError(null) // Clear any previous errors
        console.log('🎵 Loading Phish data...')
        
        // Load summer 2025 shows and song statistics
        const showsData = await phishApi.getSummer2025Shows()
        const songsData = await phishApi.getSongStats()
        
        console.log('📊 Loaded data:', { 
          shows: showsData.length, 
          songs: songsData.length 
        })
        
        // Log sample song data for debugging
        if (songsData.length > 0) {
          console.log('🎵 Sample songs loaded:', songsData.slice(0, 3).map((s: Song) => ({
            name: s.name,
            timesPlayed: s.timesPlayed,
            averageLength: s.averageLength
          })))
        }
        
        setShows(showsData)
        setSongs(songsData)
      } catch (err) {
        console.error('❌ Error loading data:', err)
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
    // For length filtering, use the longest jam length if available, otherwise average length
    const songLength = song.longestJam?.length || song.averageLength
    if (songLength < filters.minLength || songLength > filters.maxLength) {
      return false
    }
    return true
  }).sort((a, b) => {
    const multiplier = filters.sortOrder === 'asc' ? 1 : -1
    switch (filters.sortBy) {
      case 'timesPlayed':
        return (a.timesPlayed - b.timesPlayed) * multiplier
      case 'averageLength':
        // Sort by longest jam length if available, otherwise average length
        const aLength = a.longestJam?.length || a.averageLength
        const bLength = b.longestJam?.length || b.averageLength
        return (aLength - bLength) * multiplier
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
              <h3 className="text-xl font-semibold mb-2">Most Frequently Played Songs</h3>
              <p className="text-sm text-gray-600 mb-4">
                Top 10 songs by play count from {filteredSongs.length} filtered results
              </p>
              <SongChart 
                songs={[...filteredSongs].sort((a, b) => b.timesPlayed - a.timesPlayed).slice(0, 10)} 
                type="timesPlayed" 
              />
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Longest Jam Versions</h3>
              <p className="text-sm text-gray-600 mb-4">
                Top 10 songs by longest jam length from {filteredSongs.length} filtered results
              </p>
              <SongChart 
                songs={[...filteredSongs]
                  .filter(song => song.longestJam && song.longestJam.length > 0)
                  .sort((a, b) => (b.longestJam?.length || 0) - (a.longestJam?.length || 0))
                  .slice(0, 10)} 
                type="longestJam" 
              />
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
