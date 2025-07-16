'use client'

import { Song } from '@/types/phish'

interface SongChartProps {
  songs: Song[]
  type: 'timesPlayed' | 'averageLength' | 'longestJam'
}

export function SongChart({ songs, type }: SongChartProps) {
  // Ensure we have songs to display
  if (!songs || songs.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No songs match the current filters
      </div>
    )
  }

  const maxValue = Math.max(...songs.map(song => {
    switch (type) {
      case 'timesPlayed':
        return song.timesPlayed
      case 'averageLength':
        return song.averageLength
      case 'longestJam':
        return song.longestJam?.length || 0
      default:
        return 0
    }
  }))

  return (
    <div className="space-y-3">
      {songs.slice(0, 10).map((song, index) => {
        let value: number
        let displayValue: string
        
        switch (type) {
          case 'timesPlayed':
            value = song.timesPlayed
            displayValue = value.toString()
            break
          case 'averageLength':
            value = song.averageLength
            displayValue = `${value.toFixed(1)}m`
            break
          case 'longestJam':
            value = song.longestJam?.length || 0
            displayValue = `${value.toFixed(1)}m`
            break
          default:
            value = 0
            displayValue = '0'
        }
        
        const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
        
        // Different colors for different chart types
        let barColor: string
        switch (type) {
          case 'timesPlayed':
            barColor = 'bg-gradient-to-r from-phish-blue-500 to-phish-blue-600'
            break
          case 'averageLength':
            barColor = 'bg-gradient-to-r from-phish-green-500 to-phish-green-600'
            break
          case 'longestJam':
            barColor = 'bg-gradient-to-r from-phish-purple-500 to-phish-purple-600'
            break
          default:
            barColor = 'bg-gradient-to-r from-gray-400 to-gray-500'
        }
        
        return (
          <div key={`${song.slug}-${index}`} className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <div className="w-32 text-sm text-gray-700 truncate font-medium" title={song.name}>
              {song.name}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-5 shadow-inner">
              <div
                className={`${barColor} h-5 rounded-full transition-all duration-500 shadow-sm`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <div className="w-16 text-sm text-gray-900 text-right font-semibold">
              {displayValue}
            </div>
            {type === 'longestJam' && song.longestJam && (
              <div className="w-20 text-xs text-phish-purple-600 truncate font-medium" title={`${song.longestJam.date} at ${song.longestJam.venue}`}>
                {song.longestJam.date}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
