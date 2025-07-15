'use client'

import { Song } from '@/types/phish'

interface SongChartProps {
  songs: Song[]
  type: 'timesPlayed' | 'averageLength'
}

export function SongChart({ songs, type }: SongChartProps) {
  const maxValue = Math.max(...songs.map(song => 
    type === 'timesPlayed' ? song.timesPlayed : song.averageLength
  ))

  return (
    <div className="space-y-3">
      {songs.slice(0, 10).map((song, index) => {
        const value = type === 'timesPlayed' ? song.timesPlayed : song.averageLength
        const percentage = (value / maxValue) * 100
        
        return (
          <div key={song.slug} className="flex items-center space-x-3">
            <div className="w-32 text-sm text-gray-600 truncate">{song.name}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <div className="w-16 text-sm text-gray-900 text-right">
              {type === 'timesPlayed' ? value : `${value.toFixed(1)}m`}
            </div>
          </div>
        )
      })}
    </div>
  )
}
