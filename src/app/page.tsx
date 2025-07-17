'use client'

import { useState, useEffect } from 'react'
import { Navigation, Tab } from '@/components/Navigation'
import { TourStats } from '@/components/TourStats'
import { SongChart } from '@/components/SongChart'
import { SongTable } from '@/components/SongTable'
import { FilterControls } from '@/components/FilterControls'
import { ToursExplorer } from '@/components/ToursExplorer'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { phishApi } from '@/lib/simpleLocalPhishApi'
import { Song, Show, FilterOptions } from '@/types/phish'

export default function Home() {
  const [shows, setShows] = useState<Show[]>([])
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('statistics')
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'timesPlayed',
    sortOrder: 'desc',
    minLength: 0,
    maxLength: 60,
    searchTerm: '',
    selectedTags: []
  })

  useEffect(() => {
    const loadData = async () => {
      // Only load song/show data for statistics tab
      if (activeTab !== 'statistics') return
      
      try {
        setLoading(true)
        setError(null) // Clear any previous errors
        console.log('🎵 Loading Phish data...')
        
        // Add timeout to prevent infinite loading - reduced for Safari
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Data loading timeout - please refresh the page')), 15000)
        )
        
        // Load summer 2025 shows and song statistics with timeout
        const dataPromise = Promise.all([
          phishApi.getSummer2025Shows(),
          phishApi.getSongStats()
        ])
        
        const result = await Promise.race([dataPromise, timeoutPromise])
        const [showsData, songsData] = result as [Show[], Song[]]
        
        console.log('📊 Loaded data:', { 
          shows: showsData.length, 
          songs: songsData.length 
        })
        
        // Validate data before setting state
        if (!Array.isArray(showsData) || !Array.isArray(songsData)) {
          throw new Error('Invalid data format received')
        }
        
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
  }, [activeTab])

  const filteredSongs = songs.filter(song => {
    // Search term filter
    if (filters.searchTerm && !song.name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false
    }
    // Length filter - use the longest jam length if available, otherwise average length
    const songLength = song.longestJam?.length || song.averageLength || 0
    if (songLength < filters.minLength || songLength > filters.maxLength) {
      return false
    }
    // Tags filter
    if (filters.selectedTags && filters.selectedTags.length > 0) {
      const hasSelectedTag = filters.selectedTags.some(selectedTag => 
        song.tags && song.tags.includes(selectedTag)
      )
      if (!hasSelectedTag) {
        return false
      }
    }
    return true
  }).sort((a, b) => {
    const multiplier = filters.sortOrder === 'asc' ? 1 : -1
    switch (filters.sortBy) {
      case 'timesPlayed':
        return (a.timesPlayed - b.timesPlayed) * multiplier
      case 'averageLength':
        // Sort by longest jam length if available, otherwise average length
        const aLength = a.longestJam?.length || a.averageLength || 0
        const bLength = b.longestJam?.length || b.averageLength || 0
        return (aLength - bLength) * multiplier
      case 'name':
        return a.name.localeCompare(b.name) * multiplier
      case 'firstPlayed':
        const aFirst = a.firstPlayed || '9999-99-99'
        const bFirst = b.firstPlayed || '9999-99-99'
        return aFirst.localeCompare(bFirst) * multiplier
      case 'lastPlayed':
        const aLast = a.lastPlayed || '0000-00-00'
        const bLast = b.lastPlayed || '0000-00-00'
        return aLast.localeCompare(bLast) * multiplier
      default:
        return 0
    }
  })

  const handleSortChange = (newSortBy: FilterOptions['sortBy']) => {
    // If clicking the same column, toggle sort order
    if (newSortBy === filters.sortBy) {
      setFilters({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })
    } else {
      // If clicking a new column, use default sort order for that column
      const defaultOrder = newSortBy === 'name' || newSortBy === 'firstPlayed' || newSortBy === 'lastPlayed' ? 'asc' : 'desc'
      setFilters({ ...filters, sortBy: newSortBy, sortOrder: defaultOrder })
    }
  }

  const handleTagClick = (tag: string) => {
    const selectedTags = filters.selectedTags || []
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    setFilters({ ...filters, selectedTags: newSelectedTags })
  }

  const handleRetry = () => {
    setError(null)
    setLoading(true)
    // Force re-run of the effect
    setActiveTab(activeTab === 'statistics' ? 'statistics' : 'statistics')
  }

  if (loading && activeTab === 'statistics') return <LoadingSpinner />
  if (error && activeTab === 'statistics') return <ErrorDisplay error={error} onRetry={handleRetry} />

  return (
    <div className="min-h-screen bg-gradient-to-br from-phish-blue-50 via-phish-purple-50 to-phish-indigo-50">
      <header className="bg-gradient-to-r from-phish-purple-600 to-phish-blue-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg leading-tight">
            🎵 Phish Statistics Dashboard
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-phish-purple-100 mt-2 sm:mt-3 font-medium">
            Explore the magic ✨ • Song stats, tour data & jam analytics
          </p>
        </div>
      </header>

      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 mt-4 sm:mt-6 lg:mt-8">
        {activeTab === 'statistics' && (
          <div className="grid gap-4 sm:gap-6 lg:gap-8">
            {/* Tour Statistics Overview */}
            <section>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-phish-purple-800 mb-4 sm:mb-6 flex items-center">
                🎪 Current Summer Tour Overview
              </h2>
              <TourStats shows={shows} songs={songs} />
            </section>

            {/* Filters */}
            <section>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-phish-purple-800 mb-4 sm:mb-6 flex items-center">
                🎵 Song Analytics
              </h2>
              <FilterControls filters={filters} onFiltersChange={setFilters} songs={songs} />
            </section>

            {/* Charts */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-phish-purple-200 p-4 sm:p-6 lg:p-8">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 text-phish-blue-700">🔥 Most Frequently Played Songs</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                  Top 10 songs by play count from {filteredSongs.length} filtered results
                </p>
                <SongChart 
                  songs={[...filteredSongs].sort((a, b) => b.timesPlayed - a.timesPlayed).slice(0, 10)} 
                  type="timesPlayed" 
                />
              </div>
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-phish-green-200 p-4 sm:p-6 lg:p-8">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 text-phish-green-700">🎸 Longest Jam Versions</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
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
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-phish-purple-800 mb-4 sm:mb-6 flex items-center">
                📊 Detailed Song Statistics
              </h3>
              <SongTable 
                songs={filteredSongs} 
                sortBy={filters.sortBy}
                sortOrder={filters.sortOrder}
                onSortChange={handleSortChange}
                onTagClick={handleTagClick}
              />
            </section>
          </div>
        )}

        {activeTab === 'tours' && (
          <ToursExplorer />
        )}
      </main>
    </div>
  )
}
