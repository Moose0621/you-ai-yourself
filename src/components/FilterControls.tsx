import { FilterOptions, Song } from '@/types/phish'
import { useState, useRef, useEffect, useMemo } from 'react'

interface FilterControlsProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  songs: Song[]
}

export function FilterControls({ filters, onFiltersChange, songs }: FilterControlsProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<Song[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Get all unique tags from songs
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    songs.forEach(song => {
      if (song.tags) {
        song.tags.forEach(tag => tagSet.add(tag))
      }
    })
    return Array.from(tagSet).sort()
  }, [songs])

  const handleSortChange = (sortBy: FilterOptions['sortBy']) => {
    onFiltersChange({ ...filters, sortBy })
  }

  const handleOrderChange = (sortOrder: FilterOptions['sortOrder']) => {
    onFiltersChange({ ...filters, sortOrder })
  }

  const handleSearchChange = (searchTerm: string) => {
    onFiltersChange({ ...filters, searchTerm })
    
    // Filter suggestions based on search term
    if (searchTerm.trim()) {
      const suggestions = songs
        .filter(song => 
          song.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 10) // Limit to 10 suggestions
        .sort((a, b) => {
          // Prioritize exact matches and songs that start with the search term
          const aStartsWith = a.name.toLowerCase().startsWith(searchTerm.toLowerCase())
          const bStartsWith = b.name.toLowerCase().startsWith(searchTerm.toLowerCase())
          if (aStartsWith && !bStartsWith) return -1
          if (!aStartsWith && bStartsWith) return 1
          return a.name.localeCompare(b.name)
        })
      
      setFilteredSuggestions(suggestions)
      setShowSuggestions(suggestions.length > 0)
    } else {
      setShowSuggestions(false)
      setFilteredSuggestions([])
    }
  }

  const handleSuggestionClick = (songName: string) => {
    onFiltersChange({ ...filters, searchTerm: songName })
    setShowSuggestions(false)
    setFilteredSuggestions([])
  }

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow click events to register
    setTimeout(() => setShowSuggestions(false), 150)
  }

  const handleInputFocus = () => {
    if (filters.searchTerm && filteredSuggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        suggestionsRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLengthChange = (minLength: number, maxLength: number) => {
    onFiltersChange({ ...filters, minLength, maxLength })
  }

  const handleTagToggle = (tag: string) => {
    const selectedTags = filters.selectedTags || []
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    onFiltersChange({ ...filters, selectedTags: newSelectedTags })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      sortBy: 'timesPlayed',
      sortOrder: 'desc',
      minLength: 0,
      maxLength: 60,
      searchTerm: '',
      selectedTags: []
    })
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-phish-purple-200 p-8">
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {/* Search */}
        <div className="relative">
          <label className="block text-sm font-bold text-phish-purple-700 mb-3">
            🔍 Search Songs
          </label>
          <input
            ref={searchInputRef}
            type="text"
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Song name..."
            className="w-full px-4 py-3 border-2 border-phish-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-phish-purple-400 focus:border-phish-purple-400 text-gray-900 transition-all"
          />
          
          {/* Autocomplete Suggestions */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-10 w-full mt-2 bg-white border-2 border-phish-purple-200 rounded-xl shadow-xl max-h-60 overflow-y-auto"
            >
              {filteredSuggestions.map((song, index) => (
                <div
                  key={`${song.name}-${index}`}
                  onClick={() => handleSuggestionClick(song.name)}
                  className="px-4 py-3 cursor-pointer hover:bg-phish-purple-50 border-b border-phish-purple-100 last:border-b-0"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-semibold">{song.name}</span>
                    <span className="text-xs text-phish-blue-600 font-medium">
                      {song.timesPlayed} plays
                    </span>
                  </div>
                  {song.longestJam && (
                    <div className="text-xs text-phish-purple-500 mt-1 font-medium">
                      Longest: {Math.floor(song.longestJam.length)}:{(song.longestJam.length % 1 * 60).toFixed(0).padStart(2, '0')} 
                      {song.longestJam.date && ` (${song.longestJam.date})`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-bold text-phish-purple-700 mb-3">
            📊 Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value as FilterOptions['sortBy'])}
            className="w-full px-4 py-3 border-2 border-phish-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-phish-purple-400 focus:border-phish-purple-400 text-gray-900 transition-all"
          >
            <option value="timesPlayed">Times Played</option>
            <option value="averageLength">Song Length (avg/longest)</option>
            <option value="name">Song Name</option>
            <option value="firstPlayed">First Played</option>
            <option value="lastPlayed">Last Played</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-bold text-phish-purple-700 mb-3">
            📈 Order
          </label>
          <select
            value={filters.sortOrder}
            onChange={(e) => handleOrderChange(e.target.value as FilterOptions['sortOrder'])}
            className="w-full px-4 py-3 border-2 border-phish-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-phish-purple-400 focus:border-phish-purple-400 text-gray-900 transition-all"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        {/* Length Filter */}
        <div>
          <label className="block text-sm font-bold text-phish-purple-700 mb-3">
            ⏱️ Length Range (min) - filters by longest jam or avg
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={filters.minLength}
              onChange={(e) => handleLengthChange(Number(e.target.value), filters.maxLength)}
              placeholder="Min"
              min="0"
              className="w-full px-4 py-3 border-2 border-phish-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-phish-purple-400 focus:border-phish-purple-400 text-gray-900 transition-all"
            />
            <input
              type="number"
              value={filters.maxLength}
              onChange={(e) => handleLengthChange(filters.minLength, Number(e.target.value))}
              placeholder="Max"
              min="0"
              className="w-full px-4 py-3 border-2 border-phish-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-phish-purple-400 focus:border-phish-purple-400 text-gray-900 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Tag Filtering */}
      <div className="border-t-2 border-phish-purple-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-bold text-phish-purple-700">
            🏷️ Filter by Tags ({(filters.selectedTags || []).length} selected)
          </label>
          {((filters.selectedTags && filters.selectedTags.length > 0) || filters.searchTerm || filters.minLength > 0 || filters.maxLength < 60) && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-phish-blue-600 hover:text-phish-blue-800 font-bold px-3 py-1 rounded-lg hover:bg-phish-blue-50 transition-all"
            >
              Clear All Filters
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-3 max-h-40 overflow-y-auto">
          {allTags.map((tag) => {
            const isSelected = (filters.selectedTags || []).includes(tag)
            return (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                  isSelected
                    ? 'bg-gradient-to-r from-phish-blue-500 to-phish-blue-600 text-white shadow-lg'
                    : 'bg-phish-purple-100 text-phish-purple-700 hover:bg-phish-purple-200 border border-phish-purple-200'
                }`}
              >
                {tag}
              </button>
            )
          })}
        </div>
        {allTags.length === 0 && (
          <p className="text-sm text-phish-purple-500 italic font-medium">No tags available in current data</p>
        )}
      </div>
    </div>
  )
}
