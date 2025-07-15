import { render, screen } from '@testing-library/react'
import { TourStats } from '@/components/TourStats'
import { mockDataGenerators } from '../testHelpers'

describe('TourStats Component', () => {
  describe('With Sample Data (8 songs)', () => {
    it('should render stats correctly with sample data', () => {
      const sampleSongs = Array.from({ length: 8 }, (_, index) => 
        mockDataGenerators.createSong({
          name: `Song ${index + 1}`,
          timesPlayed: (index + 1) * 100,
          averageLength: 10 + index
        })
      )
      
      const sampleShows = Array.from({ length: 3 }, (_, index) => 
        mockDataGenerators.createShow({
          showdate: `2025-07-${13 - index}`,
          venue: `Venue ${index + 1}`
        })
      )

      render(<TourStats shows={sampleShows} songs={sampleSongs} />)

      expect(screen.getByText('3')).toBeInTheDocument() // Shows count
      expect(screen.getByText('8')).toBeInTheDocument() // Songs count
      expect(screen.getByText('Shows This Tour')).toBeInTheDocument()
      expect(screen.getByText('Unique Songs')).toBeInTheDocument()
    })
  })

  describe('With Real Data Scale (955+ songs)', () => {
    it('should handle large datasets efficiently', () => {
      // Simulate real Phish.net data scale
      const largeSongSet = Array.from({ length: 955 }, (_, index) => 
        mockDataGenerators.createSong({
          name: `Song ${index + 1}`,
          timesPlayed: Math.floor(Math.random() * 1000) + 1,
          averageLength: Math.random() * 20 + 1
        })
      )
      
      const manyShows = Array.from({ length: 50 }, (_, index) => 
        mockDataGenerators.createShow({
          showdate: `2023-${String(Math.floor(index / 30) + 1).padStart(2, '0')}-${String((index % 30) + 1).padStart(2, '0')}`,
          venue: `Venue ${index + 1}`
        })
      )

      const renderStart = Date.now()
      render(<TourStats shows={manyShows} songs={largeSongSet} />)
      const renderTime = Date.now() - renderStart

      // Should render efficiently even with large datasets
      expect(renderTime).toBeLessThan(1000) // Under 1 second
      expect(screen.getByText('955')).toBeInTheDocument() // Songs count
      expect(screen.getByText('50')).toBeInTheDocument() // Shows count
    })

    it('should calculate statistics correctly with large numbers', () => {
      const songsWithKnownStats = [
        mockDataGenerators.createSong({ timesPlayed: 1000, averageLength: 10 }),
        mockDataGenerators.createSong({ timesPlayed: 500, averageLength: 20 }),
        mockDataGenerators.createSong({ timesPlayed: 300, averageLength: 15 }),
      ]
      
      const shows = [mockDataGenerators.createShow()]

      render(<TourStats shows={shows} songs={songsWithKnownStats} />)

      // Total songs played: 1000 + 500 + 300 = 1800
      expect(screen.getByText('1800')).toBeInTheDocument()
      
      // Average length: (10 + 20 + 15) / 3 = 15.0
      expect(screen.getByText('15.0m')).toBeInTheDocument()
    })
  })

  describe('Statistical Validation', () => {
    it('should display meaningful statistics for popular songs', () => {
      // Create songs with realistic Phish play counts
      const popularSongs = [
        mockDataGenerators.createSong({ 
          name: 'You Enjoy Myself', 
          timesPlayed: 1647, 
          averageLength: 18.5 
        }),
        mockDataGenerators.createSong({ 
          name: 'Harry Hood', 
          timesPlayed: 523, 
          averageLength: 12.3 
        }),
        mockDataGenerators.createSong({ 
          name: 'Fluffhead', 
          timesPlayed: 389, 
          averageLength: 15.2 
        }),
      ]
      
      const shows = Array.from({ length: 10 }, () => mockDataGenerators.createShow())

      render(<TourStats shows={shows} songs={popularSongs} />)

      // Total plays should be sum of all song plays
      const expectedTotal = 1647 + 523 + 389
      expect(screen.getByText(expectedTotal.toString())).toBeInTheDocument()
      
      // Should show 3 unique songs
      expect(screen.getByText('3')).toBeInTheDocument()
      
      // Should show 10 shows
      expect(screen.getByText('10')).toBeInTheDocument()
    })

    it('should handle edge cases gracefully', () => {
      // Empty data
      render(<TourStats shows={[]} songs={[]} />)
      
      // Use getAllByText to handle multiple instances of "0"
      const zeroElements = screen.getAllByText('0')
      expect(zeroElements.length).toBeGreaterThanOrEqual(2) // Shows and Songs both show "0"
      expect(screen.getByText('0.0m')).toBeInTheDocument() // Avg length (NaN becomes 0)
    })

    it('should handle single song/show correctly', () => {
      const singleSong = [mockDataGenerators.createSong({ 
        timesPlayed: 100, 
        averageLength: 5.5 
      })]
      const singleShow = [mockDataGenerators.createShow()]

      render(<TourStats shows={singleShow} songs={singleSong} />)

      // Use more specific text matching to avoid conflicts
      expect(screen.getByText('Shows This Tour')).toBeInTheDocument()
      expect(screen.getByText('Unique Songs')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument() // Total plays
      expect(screen.getByText('5.5m')).toBeInTheDocument() // Avg length
      
      // Check that we have exactly the expected number of "1"s
      const oneElements = screen.getAllByText('1')
      expect(oneElements.length).toBe(2) // Shows and Songs both show "1"
    })
  })

  describe('Real Data Structure Compatibility', () => {
    it('should work with songs missing optional properties', () => {
      const minimalSongs = [
        {
          name: 'Minimal Song 1',
          slug: 'minimal-song-1',
          timesPlayed: 50,
          averageLength: 7.2
        },
        {
          name: 'Minimal Song 2', 
          slug: 'minimal-song-2',
          timesPlayed: 30,
          averageLength: 4.8
        }
      ]
      
      const shows = [mockDataGenerators.createShow()]

      render(<TourStats shows={shows} songs={minimalSongs} />)

      expect(screen.getByText('2')).toBeInTheDocument() // Songs count
      expect(screen.getByText('80')).toBeInTheDocument() // Total plays: 50 + 30
      expect(screen.getByText('6.0m')).toBeInTheDocument() // Avg: (7.2 + 4.8) / 2
    })

    it('should format large numbers appropriately', () => {
      const highPlayCountSongs = [
        mockDataGenerators.createSong({ timesPlayed: 10000, averageLength: 12.5 }),
        mockDataGenerators.createSong({ timesPlayed: 5000, averageLength: 7.5 }),
      ]
      
      const shows = [mockDataGenerators.createShow()]

      render(<TourStats shows={shows} songs={highPlayCountSongs} />)

      // Should display large numbers without formatting issues
      expect(screen.getByText('15000')).toBeInTheDocument() // Total plays
      expect(screen.getByText('10.0m')).toBeInTheDocument() // Average length
    })

    it('should maintain precision in average calculations', () => {
      const preciseSongs = [
        mockDataGenerators.createSong({ averageLength: 3.333 }),
        mockDataGenerators.createSong({ averageLength: 6.666 }),
        mockDataGenerators.createSong({ averageLength: 9.999 }),
      ]
      
      const shows = [mockDataGenerators.createShow()]

      render(<TourStats shows={shows} songs={preciseSongs} />)

      // (3.333 + 6.666 + 9.999) / 3 = 6.666, rounded to 6.7
      expect(screen.getByText('6.7m')).toBeInTheDocument()
    })
  })

  describe('Performance with Real Data Scale', () => {
    it('should render quickly with realistic data volumes', () => {
      // Test with a dataset similar to real Phish data
      const realisticSongs = Array.from({ length: 500 }, (_, index) => {
        // Create realistic distribution
        const playCount = index < 50 ? 
          Math.floor(Math.random() * 1000) + 500 : // Popular songs
          Math.floor(Math.random() * 200) + 1      // Less popular songs
        
        return mockDataGenerators.createSong({
          name: `Song ${index + 1}`,
          timesPlayed: playCount,
          averageLength: Math.random() * 15 + 3 // 3-18 minutes
        })
      })
      
      const realisticShows = Array.from({ length: 100 }, (_, index) => 
        mockDataGenerators.createShow({
          showdate: `2020-${String(Math.floor(index / 30) + 1).padStart(2, '0')}-${String((index % 30) + 1).padStart(2, '0')}`
        })
      )

      const start = performance.now()
      render(<TourStats shows={realisticShows} songs={realisticSongs} />)
      const end = performance.now()

      // Should render in reasonable time
      expect(end - start).toBeLessThan(100) // Under 100ms
      
      // Should display correct counts
      expect(screen.getByText('500')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
    })
  })
})