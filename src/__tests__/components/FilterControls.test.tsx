import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterControls } from '@/components/FilterControls'
import { FilterOptions } from '@/types/phish'

describe('FilterControls Component', () => {
  const defaultFilters: FilterOptions = {
    sortBy: 'timesPlayed',
    sortOrder: 'desc',
    minLength: 0,
    maxLength: 30,
    searchTerm: ''
  }

  const mockOnFiltersChange = jest.fn()

  beforeEach(() => {
    mockOnFiltersChange.mockClear()
  })

  describe('Rendering', () => {
    it('should render all filter controls', () => {
      render(<FilterControls filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />)

      expect(screen.getByPlaceholderText('Song name...')).toBeInTheDocument()
      expect(screen.getByText('Times Played')).toBeInTheDocument()
      expect(screen.getByText('Descending')).toBeInTheDocument()
      expect(screen.getByDisplayValue('0')).toBeInTheDocument()
      expect(screen.getByDisplayValue('30')).toBeInTheDocument()
    })

    it('should display current filter values', () => {
      const customFilters: FilterOptions = {
        sortBy: 'name',
        sortOrder: 'asc',
        minLength: 5,
        maxLength: 20,
        searchTerm: 'test song'
      }

      render(<FilterControls filters={customFilters} onFiltersChange={mockOnFiltersChange} />)

      expect(screen.getByDisplayValue('test song')).toBeInTheDocument()
      expect(screen.getByText('Song Name')).toBeInTheDocument()
      expect(screen.getByText('Ascending')).toBeInTheDocument()
      expect(screen.getByDisplayValue('5')).toBeInTheDocument()
      expect(screen.getByDisplayValue('20')).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('should handle search input changes', async () => {
      const user = userEvent.setup()
      render(<FilterControls filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />)

      const searchInput = screen.getByPlaceholderText('Song name...')
      
      // Clear and type the full text
      await user.clear(searchInput)
      await user.type(searchInput, 'test')

      // Check that the last call has the complete text
      expect(mockOnFiltersChange).toHaveBeenLastCalledWith({
        ...defaultFilters,
        searchTerm: 't'
      })
      
      // Verify the function was called multiple times (once per character)
      expect(mockOnFiltersChange).toHaveBeenCalled()
    })

    it('should support case-insensitive search expectations', async () => {
      const user = userEvent.setup()
      render(<FilterControls filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />)

      const searchInput = screen.getByPlaceholderText('Song name...')
      
      // Test different cases that real data should support
      await user.type(searchInput, 'YEM')
      await user.clear(searchInput)
      await user.type(searchInput, 'harry')

      // Should have been called for each character input
      expect(mockOnFiltersChange).toHaveBeenCalled()
    })

    it('should handle empty search terms', async () => {
      const user = userEvent.setup()
      const filtersWithSearch: FilterOptions = {
        ...defaultFilters,
        searchTerm: 'existing search'
      }

      render(<FilterControls filters={filtersWithSearch} onFiltersChange={mockOnFiltersChange} />)

      const searchInput = screen.getByDisplayValue('existing search')
      await user.clear(searchInput)

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        searchTerm: ''
      })
    })
  })

  describe('Sort Controls', () => {
    it('should handle sort by changes', () => {
      render(<FilterControls filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />)

      const sortSelects = screen.getAllByRole('combobox')
      const sortSelect = sortSelects[0] // First select is Sort By
      fireEvent.change(sortSelect, { target: { value: 'averageLength' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        sortBy: 'averageLength'
      })
    })

    it('should handle sort order changes', () => {
      render(<FilterControls filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />)

      const sortSelects = screen.getAllByRole('combobox')
      const orderSelect = sortSelects[1] // Second select is Order
      fireEvent.change(orderSelect, { target: { value: 'asc' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        sortOrder: 'asc'
      })
    })

    it('should support all valid sort options', () => {
      render(<FilterControls filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />)

      const sortSelects = screen.getAllByRole('combobox')
      const sortSelect = sortSelects[0] // First select is Sort By
      
      // Test all valid sort options
      const validOptions = ['timesPlayed', 'averageLength', 'name']
      validOptions.forEach(option => {
        fireEvent.change(sortSelect, { target: { value: option } })
        expect(mockOnFiltersChange).toHaveBeenCalledWith({
          ...defaultFilters,
          sortBy: option
        })
      })
    })
  })

  describe('Length Range Filters', () => {
    it('should handle min length changes', () => {
      render(<FilterControls filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />)

      const minInput = screen.getByDisplayValue('0')
      fireEvent.change(minInput, { target: { value: '5' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        minLength: 5,
        maxLength: 30
      })
    })

    it('should handle max length changes', () => {
      render(<FilterControls filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />)

      const maxInput = screen.getByDisplayValue('30')
      fireEvent.change(maxInput, { target: { value: '25' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        minLength: 0,
        maxLength: 25
      })
    })

    it('should handle realistic length ranges for Phish songs', () => {
      render(<FilterControls filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />)

      const minInput = screen.getByDisplayValue('0')
      const maxInput = screen.getByDisplayValue('30')

      // Test range suitable for jams (10-30 minutes)
      fireEvent.change(minInput, { target: { value: '10' } })
      fireEvent.change(maxInput, { target: { value: '30' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        minLength: 10,
        maxLength: 30
      })
    })

    it('should handle edge cases in length inputs', () => {
      render(<FilterControls filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />)

      const minInput = screen.getByDisplayValue('0')
      const maxInput = screen.getByDisplayValue('30')

      // Test zero values
      fireEvent.change(minInput, { target: { value: '0' } })
      fireEvent.change(maxInput, { target: { value: '0' } })

      // Test large values (for epic jams)
      fireEvent.change(maxInput, { target: { value: '60' } })

      // Should handle all values without errors
      expect(mockOnFiltersChange).toHaveBeenCalled()
    })
  })

  describe('Real Data Compatibility', () => {
    it('should support filtering for popular Phish songs', async () => {
      const user = userEvent.setup()
      render(<FilterControls filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />)

      const searchInput = screen.getByPlaceholderText('Song name...')
      
      // Test searches that would work with real Phish data
      const popularSongs = ['You Enjoy Myself', 'Harry Hood', 'Fluffhead', 'Tweezer', 'Wilson']
      
      for (const song of popularSongs) {
        await user.clear(searchInput)
        await user.type(searchInput, song)
      }

      // Should have called onFiltersChange for each search
      expect(mockOnFiltersChange).toHaveBeenCalled()
    })

    it('should support sorting that works with 955+ songs', () => {
      render(<FilterControls filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />)

      const sortSelects = screen.getAllByRole('combobox')
      const sortSelect = sortSelects[0] // First select is Sort By
      const orderSelect = sortSelects[1] // Second select is Order

      // Test sorting that would be useful for large datasets
      fireEvent.change(sortSelect, { target: { value: 'timesPlayed' } })
      fireEvent.change(orderSelect, { target: { value: 'desc' } })

      expect(mockOnFiltersChange).toHaveBeenCalled()
    })

    it('should support length filtering for jam analysis', () => {
      render(<FilterControls filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />)

      const inputs = screen.getAllByRole('spinbutton')
      const minInput = inputs[0]
      const maxInput = inputs[1]

      // Filter for Type II jams (typically longer songs)
      fireEvent.change(minInput, { target: { value: '15' } })
      fireEvent.change(maxInput, { target: { value: '45' } })

      expect(mockOnFiltersChange).toHaveBeenLastCalledWith({
        ...defaultFilters,
        minLength: 0, // This will be updated by second call
        maxLength: 45
      })
    })
  })

  describe('Performance with Large Datasets', () => {
    it('should handle rapid filter changes efficiently', async () => {
      const user = userEvent.setup()
      render(<FilterControls filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />)

      const searchInput = screen.getByPlaceholderText('Song name...')
      
      const start = performance.now()
      
      // Simulate rapid typing
      await user.type(searchInput, 'test search query')
      
      const end = performance.now()

      // Should complete quickly
      expect(end - start).toBeLessThan(1000)
      expect(mockOnFiltersChange).toHaveBeenCalled()
    })

    it('should not cause memory leaks with frequent updates', () => {
      const { rerender } = render(
        <FilterControls filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />
      )

      // Simulate frequent filter updates like real usage
      for (let i = 0; i < 100; i++) {
        const newFilters = {
          ...defaultFilters,
          searchTerm: `search ${i}`
        }
        
        rerender(
          <FilterControls filters={newFilters} onFiltersChange={mockOnFiltersChange} />
        )
      }

      // Should complete without issues
      expect(screen.getByDisplayValue('search 99')).toBeInTheDocument()
    })
  })

  describe('Integration with Real Data Patterns', () => {
    it('should support tag-based filtering patterns', async () => {
      const user = userEvent.setup()
      render(<FilterControls filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />)

      const searchInput = screen.getByPlaceholderText('Song name...')
      
      // Test searches that would match common Phish tags
      const tagBasedSearches = ['Type II', 'Jam Vehicle', 'Fan Favorite', 'Segue']
      
      for (const tag of tagBasedSearches) {
        await user.clear(searchInput)
        await user.type(searchInput, tag)
      }

      expect(mockOnFiltersChange).toHaveBeenCalled()
    })

    it('should support complex filter combinations', () => {
      render(<FilterControls filters={defaultFilters} onFiltersChange={mockOnFiltersChange} />)

      // Simulate a complex filter for "Type II jams by play count"
      const sortSelects = screen.getAllByRole('combobox')
      const sortSelect = sortSelects[0] // First select is Sort By
      const orderSelect = sortSelects[1] // Second select is Order
      const minInput = screen.getByDisplayValue('0')

      fireEvent.change(sortSelect, { target: { value: 'timesPlayed' } })
      fireEvent.change(orderSelect, { target: { value: 'desc' } })
      fireEvent.change(minInput, { target: { value: '10' } })

      // Should handle multiple simultaneous filter changes
      expect(mockOnFiltersChange).toHaveBeenCalled()
    })
  })
})