'use client'

import { useState, useEffect } from 'react'
import { Show } from '@/types/phish'
import { phishApi } from '@/lib/simpleLocalPhishApi'
import { ShowDetails } from './ShowDetails'
import { CalendarIcon, MapPinIcon, MusicalNoteIcon, EyeIcon } from '@heroicons/react/24/outline'

interface Tour {
  id: number
  name: string
  showCount: number
  shows: Show[]
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ToursExplorerProps {
  // Add any props if needed
}

export function ToursExplorer({}: ToursExplorerProps) {
  const [toursByYear, setToursByYear] = useState<Record<number, Tour[]>>({})
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)
  const [selectedShow, setSelectedShow] = useState<Show | null>(null)
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredTour, setHoveredTour] = useState<Tour | null>(null)
  const [viewMode, setViewMode] = useState<'tours' | 'shows' | 'show-detail'>('tours')

  useEffect(() => {
    const loadTourData = async () => {
      try {
        setLoading(true)
        console.log('🎪 Loading tour data...')
        
        const [toursData, yearsData] = await Promise.all([
          phishApi.getToursByYear(),
          phishApi.getAvailableYears()
        ])
        
        setToursByYear(toursData)
        setAvailableYears(yearsData)
        
        // Default to most recent year
        if (yearsData.length > 0) {
          setSelectedYear(yearsData[0])
        }
        
        console.log('✅ Loaded tours for', Object.keys(toursData).length, 'years')
      } catch (err) {
        console.error('❌ Error loading tour data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadTourData()
  }, [])

  const getCircularPosition = (index: number, total: number, radius: number = 200) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2 // Start from top
    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius
    return { x, y }
  }

  const getTourColor = (tourIndex: number, total: number) => {
    const hue = (tourIndex / total) * 360
    return `hsl(${hue}, 65%, 55%)`
  }

  const getTourSize = (showCount: number, maxShows: number) => {
    const minSize = 20
    const maxSize = 80
    const ratio = showCount / maxShows
    return minSize + (maxSize - minSize) * ratio
  }

  const handleShowSelect = (show: Show) => {
    setSelectedShow(show)
    setViewMode('show-detail')
  }

  const handleBackToShows = () => {
    setViewMode('shows')
    setSelectedShow(null)
  }

  const handleBackToTours = () => {
    setViewMode('tours')
    setSelectedTour(null)
    setSelectedShow(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Show details view
  if (viewMode === 'show-detail' && selectedShow) {
    return <ShowDetails show={selectedShow} onBack={handleBackToShows} />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-phish-purple-500 mx-auto mb-4"></div>
          <p className="text-phish-purple-700 text-lg">Loading tour data...</p>
        </div>
      </div>
    )
  }

  const currentYearTours = selectedYear ? toursByYear[selectedYear] || [] : []
  const maxShows = Math.max(...currentYearTours.map(tour => tour.showCount), 1)

  // Shows list view
  if (viewMode === 'shows' && selectedTour) {
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-phish-purple-200">
          <button
            onClick={handleBackToTours}
            className="inline-flex items-center space-x-2 text-phish-purple-600 hover:text-phish-purple-800 transition-colors mb-4"
          >
            <span>←</span>
            <span>Back to Tours</span>
          </button>
          
          <h2 className="text-3xl font-bold text-phish-purple-800 mb-2">
            🎪 {selectedTour.name}
          </h2>
          <p className="text-phish-purple-600 text-lg">
            {selectedTour.showCount} shows • {selectedYear}
          </p>
        </div>

        {/* Shows grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {selectedTour.shows
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((show) => (
              <div
                key={show.showid}
                className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-phish-purple-200 p-4 hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer group"
                onClick={() => handleShowSelect(show)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-phish-blue-600">
                      {formatDate(show.date)}
                    </div>
                    <EyeIcon className="w-4 h-4 text-phish-purple-400 group-hover:text-phish-purple-600 transition-colors" />
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">
                      {show.venue}
                    </h3>
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                      <MapPinIcon className="w-3 h-3" />
                      <span>{show.city}, {show.state || show.country}</span>
                    </div>
                  </div>
                  
                  {show.songs && show.songs.length > 0 && (
                    <div className="flex items-center space-x-1 text-xs text-phish-green-600">
                      <MusicalNoteIcon className="w-3 h-3" />
                      <span>{show.songs.length} songs</span>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t border-gray-100">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-phish-purple-100 text-phish-purple-800">
                      View Details
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Year Selection */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-phish-purple-200">
        <h2 className="text-3xl font-bold text-phish-purple-800 mb-4">
          🎪 Phish Tours Explorer
        </h2>
        <p className="text-phish-purple-600 mb-6 text-lg">
          Select a year to explore tours in an interactive display. 
          Click on tours to view individual shows with detailed setlists.
        </p>
        
        <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`
                px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105
                ${selectedYear === year
                  ? 'bg-gradient-to-r from-phish-purple-500 to-phish-blue-500 text-white shadow-lg'
                  : 'bg-white text-phish-purple-700 hover:bg-phish-purple-50 border border-phish-purple-200'
                }
              `}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Tours Visualization */}
      {selectedYear && currentYearTours.length > 0 && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-phish-purple-200 overflow-hidden">
          <div className="p-6 border-b border-phish-purple-200">
            <h3 className="text-2xl font-bold text-phish-purple-800">
              {selectedYear} Tours ({currentYearTours.length} tours, {currentYearTours.reduce((sum, tour) => sum + tour.showCount, 0)} shows)
            </h3>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col xl:flex-row gap-8">
              {/* Circular Visualization */}
              <div className="flex-1 flex justify-center">
                <div className="relative w-full max-w-lg" style={{ aspectRatio: '1' }}>
                  <svg width="100%" height="100%" viewBox="0 0 500 500" className="absolute inset-0">
                    {/* Center point */}
                    <circle cx="250" cy="250" r="4" fill="#6B7280" />
                    
                    {/* Tours as circles */}
                    {currentYearTours.map((tour, index) => {
                      const position = getCircularPosition(index, currentYearTours.length, 180)
                      const size = getTourSize(tour.showCount, maxShows)
                      const color = getTourColor(index, currentYearTours.length)
                      
                      return (
                        <g key={tour.id}>
                          {/* Connection line to center */}
                          <line
                            x1="250"
                            y1="250"
                            x2={250 + position.x}
                            y2={250 + position.y}
                            stroke="#E5E7EB"
                            strokeWidth="1"
                          />
                          
                          {/* Tour circle */}
                          <circle
                            cx={250 + position.x}
                            cy={250 + position.y}
                            r={size / 2}
                            fill={color}
                            opacity={hoveredTour === tour ? 0.9 : 0.7}
                            stroke={selectedTour === tour ? '#1F2937' : 'transparent'}
                            strokeWidth="3"
                            className="cursor-pointer transition-all duration-200 hover:opacity-90"
                            onMouseEnter={() => setHoveredTour(tour)}
                            onMouseLeave={() => setHoveredTour(null)}
                            onClick={() => {
                              setSelectedTour(tour)
                              setViewMode('shows')
                            }}
                          />
                          
                          {/* Show count label */}
                          <text
                            x={250 + position.x}
                            y={250 + position.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-xs font-bold fill-white pointer-events-none"
                          >
                            {tour.showCount}
                          </text>
                        </g>
                      )
                    })}
                  </svg>
                  
                  {/* Hover tooltip */}
                  {hoveredTour && (
                    <div className="absolute top-4 left-4 bg-black/90 text-white p-3 rounded-xl text-sm max-w-xs z-10">
                      <div className="font-bold">{hoveredTour.name}</div>
                      <div>{hoveredTour.showCount} shows</div>
                      {hoveredTour.shows.length > 0 && (
                        <div className="text-xs mt-1 text-gray-300">
                          {formatDate(hoveredTour.shows[0].date)} - {' '}
                          {formatDate(hoveredTour.shows[hoveredTour.shows.length - 1].date)}
                        </div>
                      )}
                      <div className="text-xs mt-2 text-blue-300">Click to explore shows →</div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quick Tour List for Mobile */}
              <div className="xl:w-80 space-y-3">
                <h4 className="text-lg font-bold text-phish-purple-800 mb-4">Quick Access</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {currentYearTours.map((tour, index) => (
                    <button
                      key={tour.id}
                      onClick={() => {
                        setSelectedTour(tour)
                        setViewMode('shows')
                      }}
                      className="w-full text-left p-3 bg-white rounded-lg border border-phish-purple-200 hover:border-phish-purple-400 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{tour.name}</div>
                          <div className="text-xs text-gray-600">{tour.showCount} shows</div>
                        </div>
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: getTourColor(index, currentYearTours.length) }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-phish-purple-200">
        <h4 className="text-xl font-bold text-phish-purple-800 mb-4">How to Explore</h4>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-phish-blue-500 rounded-full opacity-70"></div>
            <span>Each circle represents a tour</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-phish-green-500 rounded-full opacity-70"></div>
            <span>Larger circles = more shows</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gradient-to-r from-phish-red-500 to-phish-purple-500 rounded-full opacity-70"></div>
            <span>Colors distinguish tours</span>
          </div>
          <div className="flex items-center space-x-3">
            <CalendarIcon className="w-6 h-6 text-phish-purple-500" />
            <span>Click tours to explore shows</span>
          </div>
        </div>
      </div>
    </div>
  )
}
