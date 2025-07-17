import { Show, Song } from '@/types/phish'

interface TourStatsProps {
  shows: Show[]
  songs: Song[]
}

export function TourStats({ shows, songs }: TourStatsProps) {
  const totalShows = shows.length
  const uniqueSongs = songs.length
  const totalSongsPlayed = songs.reduce((sum, song) => sum + song.timesPlayed, 0)
  const averageSongLength = songs.reduce((sum, song) => sum + song.averageLength, 0) / songs.length || 0

  const stats = [
    {
      label: 'Shows This Tour',
      value: totalShows,
      color: 'bg-gradient-to-br from-phish-blue-500 to-phish-blue-600',
      icon: '🎪'
    },
    {
      label: 'Unique Songs',
      value: uniqueSongs,
      color: 'bg-gradient-to-br from-phish-green-500 to-phish-green-600',
      icon: '🎵'
    },
    {
      label: 'Total Songs Played',
      value: totalSongsPlayed,
      color: 'bg-gradient-to-br from-phish-purple-500 to-phish-purple-600',
      icon: '🎸'
    },
    {
      label: 'Avg Song Length',
      value: `${averageSongLength.toFixed(1)}m`,
      color: 'bg-gradient-to-br from-phish-orange-500 to-phish-orange-600',
      icon: '⏱️'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 transform hover:scale-105 transition-all duration-200">
          <div className={`w-12 h-12 sm:w-16 sm:h-16 ${stat.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg`}>
            <span className="text-lg sm:text-2xl">{stat.icon}</span>
          </div>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1">{stat.value}</h3>
          <p className="text-sm sm:text-base text-gray-600 font-medium">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
