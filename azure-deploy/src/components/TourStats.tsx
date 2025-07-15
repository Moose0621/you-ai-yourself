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
      color: 'bg-blue-500'
    },
    {
      label: 'Unique Songs',
      value: uniqueSongs,
      color: 'bg-green-500'
    },
    {
      label: 'Total Songs Played',
      value: totalSongsPlayed,
      color: 'bg-purple-500'
    },
    {
      label: 'Avg Song Length',
      value: `${averageSongLength.toFixed(1)}m`,
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-lg p-6">
          <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
            <div className="w-6 h-6 bg-white bg-opacity-30 rounded"></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
          <p className="text-gray-600">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
