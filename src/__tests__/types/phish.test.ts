import { Song, Show, FilterOptions, ApiResponse, PhishNetApiResponse } from '@/types/phish'
import { songValidators, showValidators, mockDataGenerators } from '../testHelpers'

describe('Phish TypeScript Interfaces', () => {
  describe('Song Interface', () => {
    it('should validate required Song properties', () => {
      const validSong: Song = {
        name: 'You Enjoy Myself',
        slug: 'you-enjoy-myself',
        timesPlayed: 1647,
        averageLength: 18.5
      }
      
      expect(songValidators.isValidSong(validSong)).toBe(true)
    })

    it('should validate Song with optional properties', () => {
      const songWithOptionals: Song = {
        name: 'Harry Hood',
        slug: 'harry-hood',
        timesPlayed: 523,
        averageLength: 12.3,
        firstPlayed: '1985-10-30',
        lastPlayed: '2025-07-08',
        gaps: [0, 1, 2, 3],
        debuts: ['1985-10-30', '1986-03-12'],
        tags: ['Fan Favorite', 'Uplifting']
      }
      
      expect(songValidators.isValidSong(songWithOptionals)).toBe(true)
      expect(songValidators.hasValidOptionalProperties(songWithOptionals)).toBe(true)
    })

    it('should handle songs with no gaps data', () => {
      const song: Song = {
        name: 'Test Song',
        slug: 'test-song',
        timesPlayed: 1,
        averageLength: 5.0,
        gaps: []
      }
      
      expect(songValidators.isValidSong(song)).toBe(true)
      expect(songValidators.hasValidOptionalProperties(song)).toBe(true)
    })

    it('should validate date formats in Song properties', () => {
      const songWithDates: Song = {
        name: 'Ghost',
        slug: 'ghost',
        timesPlayed: 298,
        averageLength: 11.4,
        firstPlayed: '1997-12-06',
        lastPlayed: '2025-07-06'
      }
      
      expect(songValidators.isValidSong(songWithDates)).toBe(true)
      expect(songValidators.hasValidOptionalProperties(songWithDates)).toBe(true)
    })

    it('should reject invalid Song objects', () => {
      const invalidSongs = [
        { name: 'Test', slug: 'test' }, // Missing required fields
        { name: 123, slug: 'test', timesPlayed: 1, averageLength: 5 }, // Wrong type for name
        { name: 'Test', slug: 'test', timesPlayed: -1, averageLength: 5 }, // Negative timesPlayed
        { name: 'Test', slug: 'test', timesPlayed: 1, averageLength: -5 }, // Negative averageLength
      ]
      
      invalidSongs.forEach(song => {
        expect(songValidators.isValidSong(song)).toBe(false)
      })
    })

    it('should reject songs with invalid optional properties', () => {
      const songsWithInvalidOptionals: Song[] = [
        {
          name: 'Test',
          slug: 'test',
          timesPlayed: 1,
          averageLength: 5,
          firstPlayed: 'invalid-date'
        },
        {
          name: 'Test',
          slug: 'test',
          timesPlayed: 1,
          averageLength: 5,
          gaps: [-1, 0, 1] // Negative gap
        },
        {
          name: 'Test',
          slug: 'test',
          timesPlayed: 1,
          averageLength: 5,
          tags: [123 as any] // Non-string tag
        }
      ]
      
      songsWithInvalidOptionals.forEach(song => {
        expect(songValidators.hasValidOptionalProperties(song)).toBe(false)
      })
    })
  })

  describe('Show Interface', () => {
    it('should validate required Show properties', () => {
      const validShow: Show = {
        showdate: '2025-07-13',
        venue: 'Charleston Coliseum',
        location: 'Charleston, WV'
      }
      
      expect(showValidators.isValidShow(validShow)).toBe(true)
    })

    it('should validate Show with optional properties', () => {
      const showWithOptionals: Show = {
        showdate: '2025-07-12',
        venue: 'Charleston Coliseum',
        location: 'Charleston, WV',
        tourName: 'Summer 2025',
        setlistdata: { set1: ['YEM', 'Hood'], set2: ['Tweezer', 'Ghost'] },
        songs: [mockDataGenerators.createSong()]
      }
      
      expect(showValidators.isValidShow(showWithOptionals)).toBe(true)
    })

    it('should validate date format in Show', () => {
      const validDates = ['2025-07-13', '1985-10-30', '2000-12-31']
      const invalidDates = ['2025-7-13', '85-10-30', '2000/12/31', 'invalid']
      
      validDates.forEach(date => {
        const show: Show = {
          showdate: date,
          venue: 'Test Venue',
          location: 'Test Location'
        }
        expect(showValidators.isValidShow(show)).toBe(true)
      })
      
      invalidDates.forEach(date => {
        const show = {
          showdate: date,
          venue: 'Test Venue',
          location: 'Test Location'
        }
        expect(showValidators.isValidShow(show)).toBe(false)
      })
    })

    it('should reject invalid Show objects', () => {
      const invalidShows = [
        { showdate: '2025-07-13', venue: 'Test' }, // Missing location
        { showdate: 12345, venue: 'Test', location: 'Test' }, // Wrong type for showdate
        { showdate: '2025-07-13', venue: 123, location: 'Test' }, // Wrong type for venue
      ]
      
      invalidShows.forEach(show => {
        expect(showValidators.isValidShow(show)).toBe(false)
      })
    })
  })

  describe('FilterOptions Interface', () => {
    it('should validate FilterOptions structure', () => {
      const filterOptions: FilterOptions = {
        sortBy: 'timesPlayed',
        sortOrder: 'desc',
        minLength: 0,
        maxLength: 30,
        searchTerm: 'test'
      }
      
      expect(filterOptions.sortBy).toBe('timesPlayed')
      expect(['asc', 'desc']).toContain(filterOptions.sortOrder)
      expect(typeof filterOptions.minLength).toBe('number')
      expect(typeof filterOptions.maxLength).toBe('number')
      expect(typeof filterOptions.searchTerm).toBe('string')
    })

    it('should support all valid sortBy options', () => {
      const validSortOptions: FilterOptions['sortBy'][] = ['timesPlayed', 'averageLength', 'name']
      
      validSortOptions.forEach(sortBy => {
        const filter: FilterOptions = {
          sortBy,
          sortOrder: 'asc',
          minLength: 0,
          maxLength: 30,
          searchTerm: ''
        }
        expect(filter.sortBy).toBe(sortBy)
      })
    })

    it('should support all valid sortOrder options', () => {
      const validOrderOptions: FilterOptions['sortOrder'][] = ['asc', 'desc']
      
      validOrderOptions.forEach(sortOrder => {
        const filter: FilterOptions = {
          sortBy: 'name',
          sortOrder,
          minLength: 0,
          maxLength: 30,
          searchTerm: ''
        }
        expect(filter.sortOrder).toBe(sortOrder)
      })
    })
  })

  describe('ApiResponse Interface', () => {
    it('should structure successful API responses correctly', () => {
      const successResponse: ApiResponse<Song[]> = {
        success: true,
        data: [mockDataGenerators.createSong()]
      }
      
      expect(successResponse.success).toBe(true)
      expect(Array.isArray(successResponse.data)).toBe(true)
      expect(successResponse.error).toBeUndefined()
    })

    it('should structure error API responses correctly', () => {
      const errorResponse: ApiResponse<Song[]> = {
        success: false,
        data: [],
        error: 'API request failed'
      }
      
      expect(errorResponse.success).toBe(false)
      expect(typeof errorResponse.error).toBe('string')
      expect(Array.isArray(errorResponse.data)).toBe(true)
    })
  })

  describe('PhishNetApiResponse Interface', () => {
    it('should structure Phish.net API responses correctly', () => {
      const phishNetResponse: PhishNetApiResponse = {
        success: true,
        total_entries: 955,
        total_pages: 20,
        page: 1,
        data: [
          { song: 'You Enjoy Myself', slug: 'you-enjoy-myself', times_played: '1647' },
          { song: 'Harry Hood', slug: 'harry-hood', times_played: '523' }
        ]
      }
      
      expect(phishNetResponse.success).toBe(true)
      expect(typeof phishNetResponse.total_entries).toBe('number')
      expect(Array.isArray(phishNetResponse.data)).toBe(true)
      expect(phishNetResponse.data.length).toBeGreaterThan(0)
    })

    it('should handle minimal Phish.net API responses', () => {
      const minimalResponse: PhishNetApiResponse = {
        success: true,
        data: []
      }
      
      expect(minimalResponse.success).toBe(true)
      expect(Array.isArray(minimalResponse.data)).toBe(true)
    })
  })

  describe('Real Data Structure Compatibility', () => {
    it('should handle large datasets efficiently', () => {
      // Simulate larger dataset like real Phish.net data (955+ songs)
      const largeSongArray: Song[] = Array.from({ length: 1000 }, (_, index) => 
        mockDataGenerators.createSong({
          name: `Song ${index + 1}`,
          slug: `song-${index + 1}`,
          timesPlayed: Math.floor(Math.random() * 1000) + 1,
          averageLength: Math.random() * 20 + 1
        })
      )
      
      // Test that our validators can handle large datasets
      const validationStart = Date.now()
      const allValid = largeSongArray.every(song => songValidators.isValidSong(song))
      const validationTime = Date.now() - validationStart
      
      expect(allValid).toBe(true)
      expect(validationTime).toBeLessThan(1000) // Should complete in under 1 second
      expect(largeSongArray.length).toBe(1000)
    })

    it('should support statistical analysis of large datasets', () => {
      // Generate realistic distribution of play counts
      const songs: Song[] = Array.from({ length: 500 }, (_, index) => {
        // Create a realistic distribution: few songs with very high counts, many with lower counts
        const baseCount = Math.floor(Math.random() * 100) + 1
        const multiplier = index < 50 ? Math.floor(Math.random() * 10) + 1 : 1
        
        return mockDataGenerators.createSong({
          name: `Song ${index + 1}`,
          slug: `song-${index + 1}`,
          timesPlayed: baseCount * multiplier
        })
      })
      
      // Statistical analysis
      const totalPlays = songs.reduce((sum, song) => sum + song.timesPlayed, 0)
      const averagePlays = totalPlays / songs.length
      const maxPlays = Math.max(...songs.map(song => song.timesPlayed))
      const minPlays = Math.min(...songs.map(song => song.timesPlayed))
      
      expect(averagePlays).toBeGreaterThan(0)
      expect(maxPlays).toBeGreaterThan(averagePlays)
      expect(minPlays).toBeGreaterThan(0)
      expect(maxPlays).toBeGreaterThan(minPlays)
    })

    it('should maintain type safety with real-world data variations', () => {
      // Test edge cases that might appear in real data
      const edgeCaseSongs: Song[] = [
        // Song with very high play count (like YEM)
        mockDataGenerators.createSong({
          name: 'You Enjoy Myself',
          timesPlayed: 1647,
          averageLength: 18.5
        }),
        // Song with very low play count (rare song)
        mockDataGenerators.createSong({
          name: 'Rare Song',
          timesPlayed: 1,
          averageLength: 3.2
        }),
        // Song with no optional properties
        {
          name: 'Minimal Song',
          slug: 'minimal-song',
          timesPlayed: 50,
          averageLength: 7.5
        },
        // Song with all optional properties
        mockDataGenerators.createSong({
          name: 'Complete Song',
          gaps: [0, 1, 2, 3, 4, 5, 6],
          tags: ['Type II', 'Jam Vehicle', 'Fan Favorite', 'Segue']
        })
      ]
      
      edgeCaseSongs.forEach(song => {
        expect(songValidators.isValidSong(song)).toBe(true)
        expect(songValidators.hasValidOptionalProperties(song)).toBe(true)
      })
    })
  })
})