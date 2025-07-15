'use client'

import { useState, useEffect } from 'react'
import { Show } from '@/types/phish'
import { phishApi } from '@/lib/simpleLocalPhishApi'

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
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredTour, setHoveredTour] = useState<Tour | null>(null)

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tour data...</p>
        </div>
      </div>
    )
  }

  const currentYearTours = selectedYear ? toursByYear[selectedYear] || [] : []
  const maxShows = Math.max(...currentYearTours.map(tour => tour.showCount), 1)

  return (
    <div className="space-y-8">
      {/* Year Selection */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Phish Tours Explorer
        </h2>
        <p className="text-gray-600 mb-6">
          Select a year to explore tours in an interactive circular display. 
          Hover over tour shapes to see details, click to view show information.
        </p>
        
        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-2">
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`
                px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${selectedYear === year
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {selectedYear} Tours ({currentYearTours.length} tours, {currentYearTours.reduce((sum, tour) => sum + tour.showCount, 0)} shows)
          </h3>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Circular Visualization */}
            <div className="flex-1 flex justify-center">
              <div className="relative" style={{ width: '500px', height: '500px' }}>
                <svg width="500" height="500" className="absolute inset-0">
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
                          onClick={() => setSelectedTour(selectedTour === tour ? null : tour)}
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
                  <div className="absolute top-4 left-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-sm max-w-xs">
                    <div className="font-bold">{hoveredTour.name}</div>
                    <div>{hoveredTour.showCount} shows</div>
                    {hoveredTour.shows.length > 0 && (
                      <div className="text-xs mt-1">
                        {new Date(hoveredTour.shows[0].date).toLocaleDateString()} - {' '}
                        {new Date(hoveredTour.shows[hoveredTour.shows.length - 1].date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Tour Details Panel */}
            <div className="lg:w-80">
              {selectedTour ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedTour.name}
                  </h4>
                  <p className="text-gray-600 mb-4">
                    {selectedTour.showCount} shows
                  </p>
                  
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {selectedTour.shows
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((show) => (
                        <div
                          key={show.showid}
                          className="bg-white p-3 rounded border hover:shadow-md transition-shadow"
                        >
                          <div className="font-medium text-sm text-gray-900">
                            {new Date(show.date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {show.venue}
                          </div>
                          <div className="text-xs text-gray-500">
                            {show.city}, {show.state || show.country}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                  <div className="text-4xl mb-2">🎪</div>
                  <p>Click on a tour circle to see show details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">How to Read the Visualization</h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full opacity-70"></div>
            <span>Each circle represents a tour</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-full opacity-70"></div>
            <span>Larger circles = more shows</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-purple-500 rounded-full opacity-70"></div>
            <span>Colors distinguish different tours</span>
          </div>
        </div>
      </div>
    </div>
  )
}
