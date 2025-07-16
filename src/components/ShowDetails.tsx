'use client'

import { useState, useEffect } from 'react'
import { Show, Song } from '@/types/phish'
import { phishApi } from '@/lib/simpleLocalPhishApi'
import { ChevronLeftIcon, ClockIcon, CalendarIcon, MapPinIcon, MusicalNoteIcon } from '@heroicons/react/24/outline'

interface ShowDetailsProps {
  show: Show
  onBack: () => void
}

interface SongWithMetadata {
  name: string
  length?: number
  position: number
  set: string
  notes?: string
  isJam?: boolean
  isCover?: boolean
  isDebut?: boolean
  encore?: boolean
}

export function ShowDetails({ show, onBack }: ShowDetailsProps) {
  const [songs, setSongs] = useState<SongWithMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [allSongData, setAllSongData] = useState<Song[]>([])

  useEffect(() => {
    const parseSetlistData = (showData: Show): SongWithMetadata[] => {
      const songs: SongWithMetadata[] = []
      
      // If we have song names in the songs array, use those
      if (showData.songs && showData.songs.length > 0) {
        showData.songs.forEach((songName, index) => {
          if (songName && songName.trim()) {
            songs.push({
              name: songName.trim(),
              position: index + 1,
              set: determineSet(index, showData.songs.length),
            })
          }
        })
      } else {
        // Fallback: create placeholder data
        songs.push({
          name: 'Setlist data not available',
          position: 1,
          set: 'Set I',
          notes: 'Complete setlist information is not available for this show'
        })
      }
      
      return songs
    }

    const loadShowData = async () => {
      try {
        setLoading(true)
        
        // Get all song data for metadata lookup
        const songStats = await phishApi.getSongStats()
        setAllSongData(songStats)
        
        // Parse setlist data from show
        const parsedSongs = parseSetlistData(show)
        setSongs(parsedSongs)
        
      } catch (error) {
        console.error('Error loading show data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadShowData()
  }, [show])

  const determineSet = (index: number, totalSongs: number): string => {
    // Simple heuristic: assume roughly equal sets
    const thirdPoint = Math.floor(totalSongs / 3)
    const twoThirdsPoint = Math.floor((totalSongs * 2) / 3)
    
    if (index < thirdPoint) return 'Set I'
    if (index < twoThirdsPoint) return 'Set II'
    return 'Encore'
  }

  const getSongMetadata = (songName: string) => {
    return allSongData.find(s => 
      s.name.toLowerCase() === songName.toLowerCase() ||
      s.slug === songName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getSetColor = (setName: string) => {
    switch (setName) {
      case 'Set I': return 'bg-phish-blue-500'
      case 'Set II': return 'bg-phish-purple-500'
      case 'Encore': return 'bg-phish-green-500'
      default: return 'bg-phish-orange-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-phish-blue-50 via-phish-purple-50 to-phish-indigo-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-phish-purple-500 mx-auto mb-4"></div>
              <p className="text-phish-purple-700">Loading show details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-phish-blue-50 via-phish-purple-50 to-phish-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-phish-purple-600 to-phish-blue-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 text-white hover:text-phish-purple-200 transition-colors mb-4"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            <span>Back to Shows</span>
          </button>
          
          <div className="text-white">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              🎵 {formatDate(show.date)}
            </h1>
            <div className="text-xl text-phish-purple-100 flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <MapPinIcon className="w-5 h-5" />
                <span>{show.venue}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5" />
                <span>{show.city}, {show.state || show.country}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Show Info Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-phish-purple-200">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-2xl font-bold text-phish-purple-800 mb-4">Show Information</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="w-5 h-5 text-phish-blue-600" />
                  <span className="text-gray-700">{formatDate(show.date)}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="w-5 h-5 text-phish-green-600" />
                  <span className="text-gray-700">{show.venue}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MusicalNoteIcon className="w-5 h-5 text-phish-purple-600" />
                  <span className="text-gray-700">{songs.length} songs performed</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-phish-purple-800 mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-phish-blue-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-phish-blue-700">
                    {songs.filter(s => s.set === 'Set I').length}
                  </div>
                  <div className="text-sm text-phish-blue-600">Set I Songs</div>
                </div>
                <div className="bg-phish-purple-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-phish-purple-700">
                    {songs.filter(s => s.set === 'Set II').length}
                  </div>
                  <div className="text-sm text-phish-purple-600">Set II Songs</div>
                </div>
              </div>
            </div>
          </div>
          
          {show.setlistnotes && (
            <div className="mt-6 p-4 bg-phish-yellow-50 rounded-lg border-l-4 border-phish-orange-500">
              <h4 className="font-semibold text-phish-orange-800 mb-2">Show Notes</h4>
              <p className="text-phish-orange-700">{show.setlistnotes}</p>
            </div>
          )}
        </div>

        {/* Setlist */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-phish-purple-200 overflow-hidden">
          <div className="p-6 border-b border-phish-purple-200">
            <h2 className="text-2xl font-bold text-phish-purple-800">🎸 Setlist</h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {songs.map((song, index) => {
              const metadata = getSongMetadata(song.name)
              return (
                <div
                  key={index}
                  className="p-4 hover:bg-phish-purple-25 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getSetColor(song.set)}`}>
                          {song.set}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {song.name}
                          </h3>
                          {metadata?.tags?.includes('Rare') && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-phish-red-100 text-phish-red-800">
                              Rare
                            </span>
                          )}
                          {metadata?.tags?.includes('Cover') && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-phish-orange-100 text-phish-orange-800">
                              Cover
                            </span>
                          )}
                        </div>
                        {song.notes && (
                          <p className="text-sm text-gray-600 mt-1">{song.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {metadata && (
                        <>
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="w-4 h-4" />
                            <span>~{metadata.averageLength.toFixed(1)}m avg</span>
                          </div>
                          <div className="text-xs">
                            Played {metadata.timesPlayed} times
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {metadata && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {metadata.firstPlayed && (
                        <div className="text-gray-600">
                          <span className="font-medium">Debut:</span> {metadata.firstPlayed}
                        </div>
                      )}
                      {metadata.lastPlayed && (
                        <div className="text-gray-600">
                          <span className="font-medium">Last:</span> {metadata.lastPlayed}
                        </div>
                      )}
                      {metadata.longestJam && (
                        <div className="text-gray-600">
                          <span className="font-medium">Longest:</span> {metadata.longestJam.length.toFixed(1)}m
                        </div>
                      )}
                      <div className="text-gray-600">
                        <span className="font-medium">Gap:</span> {metadata.gap || 'N/A'} shows
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
