import { Song, FilterOptions } from '@/types/phish'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

interface SongTableProps {
  songs: Song[]
  sortBy: FilterOptions['sortBy']
  sortOrder: FilterOptions['sortOrder']
  onSortChange: (sortBy: FilterOptions['sortBy']) => void
  onTagClick?: (tag: string) => void
}

export function SongTable({ songs, sortBy, sortOrder, onSortChange, onTagClick }: SongTableProps) {
  const handleHeaderClick = (column: FilterOptions['sortBy']) => {
    onSortChange(column)
  }

  const getSortIcon = (column: FilterOptions['sortBy']) => {
    if (sortBy !== column) {
      return <ChevronUpIcon className="w-4 h-4 text-gray-400 opacity-50" />
    }
    return sortOrder === 'asc' ? 
      <ChevronUpIcon className="w-4 h-4 text-phish-purple-600" /> : 
      <ChevronDownIcon className="w-4 h-4 text-phish-purple-600" />
  }

  const HeaderCell = ({ 
    column, 
    children, 
    className = '' 
  }: { 
    column: FilterOptions['sortBy']
    children: React.ReactNode
    className?: string 
  }) => (
    <th 
      className={`px-6 py-3 text-left text-xs font-medium text-phish-purple-700 uppercase tracking-wider cursor-pointer hover:bg-phish-purple-50 transition-colors ${className}`}
      onClick={() => handleHeaderClick(column)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {getSortIcon(column)}
      </div>
    </th>
  )

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-phish-purple-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-phish-purple-200">
          <thead className="bg-gradient-to-r from-phish-purple-50 to-phish-blue-50">
            <tr>
              <HeaderCell column="name">
                Song Name
              </HeaderCell>
              <HeaderCell column="timesPlayed">
                Times Played
              </HeaderCell>
              <HeaderCell column="averageLength">
                Avg Length
              </HeaderCell>
              <HeaderCell column="averageLength">
                Longest Jam
              </HeaderCell>
              <HeaderCell column="firstPlayed">
                First Played
              </HeaderCell>
              <HeaderCell column="lastPlayed">
                Last Played
              </HeaderCell>
              <th className="px-6 py-3 text-left text-xs font-medium text-phish-purple-700 uppercase tracking-wider">
                Tags
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {songs.slice(0, 50).map((song, index) => (
              <tr key={song.slug} className={`${index % 2 === 0 ? 'bg-white' : 'bg-phish-purple-25'} hover:bg-phish-purple-50 transition-colors`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{song.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{song.timesPlayed}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{song.averageLength.toFixed(1)}m</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {song.longestJam ? (
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">{song.longestJam.length.toFixed(1)}m</div>
                      <div className="text-xs text-gray-500" title={`${song.longestJam.venue}, ${song.longestJam.city}, ${song.longestJam.state}`}>
                        {song.longestJam.date}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">N/A</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{song.firstPlayed || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{song.lastPlayed || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {song.tags?.slice(0, 3).map((tag, tagIndex) => (
                      <button
                        key={tagIndex}
                        onClick={() => onTagClick?.(tag)}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-phish-blue-100 text-phish-blue-800 hover:bg-phish-blue-200 transition-colors cursor-pointer"
                        title={`Filter by ${tag}`}
                      >
                        {tag}
                      </button>
                    ))}
                    {(song.tags?.length || 0) > 3 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{(song.tags?.length || 0) - 3}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {songs.length > 50 && (
        <div className="bg-gradient-to-r from-phish-purple-50 to-phish-blue-50 px-6 py-3 text-center border-t border-phish-purple-200">
          <p className="text-sm text-phish-purple-700 font-medium">
            Showing first 50 of {songs.length} songs
          </p>
        </div>
      )}
    </div>
  )
}
