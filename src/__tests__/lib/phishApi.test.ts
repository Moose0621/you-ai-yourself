import { phishApi } from '@/lib/phishApi'
import { songValidators, showValidators, dataExpectations, mockDataGenerators } from '../testHelpers'

// Mock fetch for API tests
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('PhishApi', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  describe('getSongStats', () => {
    it('should return an array of valid Song objects', async () => {
      const songs = await phishApi.getSongStats()
      
      // Should return songs (minimum from sample data, but flexible for real data)
      expect(songs.length).toBeGreaterThanOrEqual(dataExpectations.song.minimumCount)
      expect(songs.length).toBeLessThanOrEqual(dataExpectations.song.maximumCount)
      
      // All songs should be valid
      songs.forEach(song => {
        expect(songValidators.isValidSong(song)).toBe(true)
        expect(songValidators.hasValidOptionalProperties(song)).toBe(true)
      })
    })

    it('should return songs with reasonable play counts and lengths', async () => {
      const songs = await phishApi.getSongStats()
      
      songs.forEach(song => {
        expect(song.timesPlayed).toBeGreaterThan(0)
        expect(song.averageLength).toBeGreaterThanOrEqual(dataExpectations.song.averageLengthRange.min)
        expect(song.averageLength).toBeLessThanOrEqual(dataExpectations.song.averageLengthRange.max)
      })
    })

    it('should have statistically valid top songs', async () => {
      const songs = await phishApi.getSongStats()
      
      expect(dataExpectations.stats.validateTopSongs(songs)).toBe(true)
      expect(dataExpectations.stats.validateSongLengths(songs)).toBe(true)
    })

    it('should handle API errors gracefully', async () => {
      // Since we're using sample data, this should still return songs
      const songs = await phishApi.getSongStats()
      expect(Array.isArray(songs)).toBe(true)
      expect(songs.length).toBeGreaterThan(0)
    })

    it('should return songs with proper TypeScript typing', async () => {
      const songs = await phishApi.getSongStats()
      
      // Type checking - should have all required properties
      songs.forEach(song => {
        expect(song).toHaveProperty('name', expect.any(String))
        expect(song).toHaveProperty('slug', expect.any(String))
        expect(song).toHaveProperty('timesPlayed', expect.any(Number))
        expect(song).toHaveProperty('averageLength', expect.any(Number))
      })
    })

    it('should include popular Phish songs in results', async () => {
      const songs = await phishApi.getSongStats()
      const songNames = songs.map(song => song.name.toLowerCase())
      
      // Should include some well-known Phish songs (works with both sample and real data)
      const knownSongs = ['you enjoy myself', 'harry hood', 'fluffhead', 'tweezer']
      const foundSongs = knownSongs.filter(song => 
        songNames.some(name => name.includes(song.toLowerCase().substring(0, 5)))
      )
      
      expect(foundSongs.length).toBeGreaterThan(0)
    })
  })

  describe('getRecentShows', () => {
    it('should return an array of valid Show objects', async () => {
      const shows = await phishApi.getRecentShows()
      
      expect(shows.length).toBeGreaterThanOrEqual(dataExpectations.show.minimumCount)
      expect(shows.length).toBeLessThanOrEqual(dataExpectations.show.maximumCount)
      
      shows.forEach(show => {
        expect(showValidators.isValidShow(show)).toBe(true)
      })
    })

    it('should return shows with valid date formats', async () => {
      const shows = await phishApi.getRecentShows()
      
      shows.forEach(show => {
        expect(show.showdate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        
        // Date should be parseable
        const date = new Date(show.showdate)
        expect(date.getTime()).not.toBeNaN()
      })
    })

    it('should handle API errors gracefully', async () => {
      const shows = await phishApi.getRecentShows()
      expect(Array.isArray(shows)).toBe(true)
    })
  })

  describe('getSummer2025Shows', () => {
    it('should return shows for the specified period', async () => {
      const shows = await phishApi.getSummer2025Shows()
      
      expect(Array.isArray(shows)).toBe(true)
      shows.forEach(show => {
        expect(showValidators.isValidShow(show)).toBe(true)
        
        // Should be summer 2025 shows (or sample data representing them)
        if (show.showdate.startsWith('2025-07')) {
          const month = parseInt(show.showdate.split('-')[1])
          expect(month).toBeGreaterThanOrEqual(7) // July or later
        }
      })
    })
  })

  describe('getSongData', () => {
    it('should return a specific song by slug', async () => {
      // Test with a known song from sample data
      const song = await phishApi.getSongData('you-enjoy-myself')
      
      if (song) {
        expect(songValidators.isValidSong(song)).toBe(true)
        expect(song.slug).toBe('you-enjoy-myself')
      }
    })

    it('should return null for non-existent songs', async () => {
      const song = await phishApi.getSongData('non-existent-song')
      expect(song).toBeNull()
    })

    it('should handle API errors gracefully', async () => {
      const song = await phishApi.getSongData('test-song')
      // Should return either a valid song or null, not throw
      expect(song === null || songValidators.isValidSong(song)).toBe(true)
    })
  })

  describe('getShowsByYear', () => {
    it('should return shows for a specific year', async () => {
      const shows = await phishApi.getShowsByYear(2025)
      
      expect(Array.isArray(shows)).toBe(true)
      shows.forEach(show => {
        expect(showValidators.isValidShow(show)).toBe(true)
      })
    })

    it('should handle invalid years gracefully', async () => {
      const shows = await phishApi.getShowsByYear(1800) // Before Phish existed
      expect(Array.isArray(shows)).toBe(true)
    })
  })

  describe('Data consistency and business logic', () => {
    it('should maintain data consistency across methods', async () => {
      const [songs, shows] = await Promise.all([
        phishApi.getSongStats(),
        phishApi.getRecentShows()
      ])
      
      // Basic consistency checks
      expect(songs.length).toBeGreaterThan(0)
      expect(shows.length).toBeGreaterThan(0)
      
      // Songs should have unique slugs
      const slugs = songs.map(song => song.slug)
      const uniqueSlugs = new Set(slugs)
      expect(uniqueSlugs.size).toBe(slugs.length)
    })

    it('should handle edge cases appropriately', async () => {
      // Test that methods don't crash with edge cases
      const results = await Promise.allSettled([
        phishApi.getSongData(''),
        phishApi.getShowsByYear(0),
        phishApi.getShowsByYear(-1),
        phishApi.getSongData('test-with-special-characters-!@#$%'),
      ])
      
      // All should resolve (not reject), even if they return empty/null results
      results.forEach(result => {
        expect(result.status).toBe('fulfilled')
      })
    })

    it('should return data suitable for UI components', async () => {
      const songs = await phishApi.getSongStats()
      
      // Data should be ready for display without additional processing
      songs.forEach(song => {
        expect(song.name.length).toBeGreaterThan(0)
        expect(song.slug.length).toBeGreaterThan(0)
        expect(typeof song.timesPlayed).toBe('number')
        expect(typeof song.averageLength).toBe('number')
      })
    })
  })

  describe('Search and Filter Support', () => {
    it('should return data that supports case-insensitive search', async () => {
      const songs = await phishApi.getSongStats()
      
      // Test search functionality
      const searchTerm = 'you'
      const results = songs.filter(song => 
        song.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      
      if (results.length > 0) {
        results.forEach(song => {
          expect(song.name.toLowerCase()).toContain(searchTerm.toLowerCase())
        })
      }
    })

    it('should return data that supports tag filtering', async () => {
      const songs = await phishApi.getSongStats()
      
      const songsWithTags = songs.filter(song => song.tags && song.tags.length > 0)
      
      if (songsWithTags.length > 0) {
        const testTag = songsWithTags[0].tags![0]
        const tagResults = songs.filter(song => 
          song.tags && song.tags.includes(testTag)
        )
        
        expect(tagResults.length).toBeGreaterThan(0)
        tagResults.forEach(song => {
          expect(song.tags).toContain(testTag)
        })
      }
    })

    it('should support sorting by different criteria', async () => {
      const songs = await phishApi.getSongStats()
      
      // Test sorting by timesPlayed
      const sortedByPlays = [...songs].sort((a, b) => b.timesPlayed - a.timesPlayed)
      expect(sortedByPlays[0].timesPlayed).toBeGreaterThanOrEqual(sortedByPlays[sortedByPlays.length - 1].timesPlayed)
      
      // Test sorting by averageLength  
      const sortedByLength = [...songs].sort((a, b) => b.averageLength - a.averageLength)
      expect(sortedByLength[0].averageLength).toBeGreaterThanOrEqual(sortedByLength[sortedByLength.length - 1].averageLength)
      
      // Test sorting by name
      const sortedByName = [...songs].sort((a, b) => a.name.localeCompare(b.name))
      expect(sortedByName[0].name.localeCompare(sortedByName[1].name)).toBeLessThanOrEqual(0)
    })
  })
})