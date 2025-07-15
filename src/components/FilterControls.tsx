import { FilterOptions } from '@/types/phish'

interface FilterControlsProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
}

export function FilterControls({ filters, onFiltersChange }: FilterControlsProps) {
  const handleSortChange = (sortBy: FilterOptions['sortBy']) => {
    onFiltersChange({ ...filters, sortBy })
  }

  const handleOrderChange = (sortOrder: FilterOptions['sortOrder']) => {
    onFiltersChange({ ...filters, sortOrder })
  }

  const handleSearchChange = (searchTerm: string) => {
    onFiltersChange({ ...filters, searchTerm })
  }

  const handleLengthChange = (minLength: number, maxLength: number) => {
    onFiltersChange({ ...filters, minLength, maxLength })
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="grid md:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Songs
          </label>
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Song name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value as FilterOptions['sortBy'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="timesPlayed">Times Played</option>
            <option value="averageLength">Song Length (avg/longest)</option>
            <option value="name">Song Name</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order
          </label>
          <select
            value={filters.sortOrder}
            onChange={(e) => handleOrderChange(e.target.value as FilterOptions['sortOrder'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        {/* Length Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Length Range (min) - filters by longest jam or avg
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={filters.minLength}
              onChange={(e) => handleLengthChange(Number(e.target.value), filters.maxLength)}
              placeholder="Min"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              value={filters.maxLength}
              onChange={(e) => handleLengthChange(filters.minLength, Number(e.target.value))}
              placeholder="Max"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
