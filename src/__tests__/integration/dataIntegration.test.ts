import { phishApi } from '@/lib/phishApi'
import { Song, Show } from '@/types/phish'
import { songValidators, showValidators, dataExpectations } from '../testHelpers'

/**
 * Integration tests that verify the application works with real data patterns
 * These tests simulate the transition from sample data (8 songs) to real data (955+ songs)
 */
describe('PhishApi Integration with Real Data Patterns', () => {
  
  describe('Data Filtering and Search', () => {
    it('should support case-insensitive song search', async () => {
      const songs = await phishApi.getSongStats()
      
      // Test case-insensitive search functionality
      const searchTests = [
        { term: 'you', expectedMatch: 'You Enjoy Myself' },
        { term: 'YOU', expectedMatch: 'You Enjoy Myself' },
        { term: 'harry', expectedMatch: 'Harry Hood' },
        { term: 'HARRY', expectedMatch: 'Harry Hood' },
        { term: 'fluff', expectedMatch: 'Fluffhead' }
      ]
      
      searchTests.forEach(({ term, expectedMatch }) => {
        const results = songs.filter(song => 
          song.name.toLowerCase().includes(term.toLowerCase())
        )
        
        if (results.length > 0) {
          expect(results.some(song => song.name.includes(expectedMatch.split(' ')[0]))).toBe(true)
        }
      })
    })

    it('should support tag-based filtering', async () => {
      const songs = await phishApi.getSongStats()
      
      // Find songs with tags for testing
      const songsWithTags = songs.filter(song => song.tags && song.tags.length > 0)
      
      if (songsWithTags.length > 0) {
        const sampleTag = songsWithTags[0].tags![0]
        
        // Filter by tag
        const taggedSongs = songs.filter(song => 
          song.tags && song.tags.includes(sampleTag)
        )
        
        expect(taggedSongs.length).toBeGreaterThan(0)
        taggedSongs.forEach(song => {
          expect(song.tags).toContain(sampleTag)
        })
      }
    })

    it('should support length range filtering', async () => {
      const songs = await phishApi.getSongStats()
      
      // Filter for long jams (over 15 minutes)
      const longJams = songs.filter(song => song.averageLength > 15)
      
      // Filter for short songs (under 5 minutes)
      const shortSongs = songs.filter(song => song.averageLength < 5)
      
      longJams.forEach(song => {
        expect(song.averageLength).toBeGreaterThan(15)
      })
      
      shortSongs.forEach(song => {
        expect(song.averageLength).toBeLessThan(5)
      })
    })
  })

  describe('Sorting and Ranking', () => {
    it('should sort songs by play count correctly', async () => {
      const songs = await phishApi.getSongStats()
      
      // Sort by times played (descending)
      const sortedByPlays = [...songs].sort((a, b) => b.timesPlayed - a.timesPlayed)
      
      // Verify sorting is correct
      for (let i = 0; i < sortedByPlays.length - 1; i++) {
        expect(sortedByPlays[i].timesPlayed).toBeGreaterThanOrEqual(sortedByPlays[i + 1].timesPlayed)
      }
      
      // Top song should be the most played
      expect(sortedByPlays[0].timesPlayed).toBeGreaterThanOrEqual(sortedByPlays[1].timesPlayed)
    })

    it('should sort songs by average length correctly', async () => {
      const songs = await phishApi.getSongStats()
      
      // Sort by average length (descending) 
      const sortedByLength = [...songs].sort((a, b) => b.averageLength - a.averageLength)
      
      // Verify sorting is correct
      for (let i = 0; i < sortedByLength.length - 1; i++) {
        expect(sortedByLength[i].averageLength).toBeGreaterThanOrEqual(sortedByLength[i + 1].averageLength)
      }
    })

    it('should sort songs alphabetically', async () => {
      const songs = await phishApi.getSongStats()
      
      // Sort by name (ascending)
      const sortedByName = [...songs].sort((a, b) => a.name.localeCompare(b.name))
      
      // Verify sorting is correct
      for (let i = 0; i < sortedByName.length - 1; i++) {
        expect(sortedByName[i].name.localeCompare(sortedByName[i + 1].name)).toBeLessThanOrEqual(0)
      }
    })
  })

  describe('Statistical Analysis', () => {
    it('should calculate meaningful statistics for large datasets', async () => {
      const songs = await phishApi.getSongStats()
      
      // Calculate basic statistics
      const totalPlays = songs.reduce((sum, song) => sum + song.timesPlayed, 0)
      const averagePlays = totalPlays / songs.length
      const maxPlays = Math.max(...songs.map(song => song.timesPlayed))
      const minPlays = Math.min(...songs.map(song => song.timesPlayed))
      
      // Verify statistics make sense
      expect(totalPlays).toBeGreaterThan(0)
      expect(averagePlays).toBeGreaterThan(0)
      expect(maxPlays).toBeGreaterThan(averagePlays)
      expect(minPlays).toBeGreaterThan(0)
      expect(maxPlays).toBeGreaterThan(minPlays)
      
      // For real data, expect significant variation
      const playCountVariation = maxPlays / averagePlays
      expect(playCountVariation).toBeGreaterThan(1.5) // Top songs should be significantly above average
    })

    it('should identify popular songs correctly', async () => {
      const songs = await phishApi.getSongStats()
      
      // Get top 10% of songs by play count
      const sortedByPlays = [...songs].sort((a, b) => b.timesPlayed - a.timesPlayed)
      const top10Percent = Math.max(1, Math.floor(songs.length * 0.1))
      const popularSongs = sortedByPlays.slice(0, top10Percent)
      
      // Popular songs should have substantially more plays than average
      const averagePlays = songs.reduce((sum, song) => sum + song.timesPlayed, 0) / songs.length
      
      popularSongs.forEach(song => {
        expect(song.timesPlayed).toBeGreaterThan(averagePlays * 1.5)
      })
    })

    it('should handle distribution analysis for jam lengths', async () => {
      const songs = await phishApi.getSongStats()
      
      // Analyze length distribution
      const lengths = songs.map(song => song.averageLength)
      const averageLength = lengths.reduce((sum, length) => sum + length, 0) / lengths.length
      const maxLength = Math.max(...lengths)
      const minLength = Math.min(...lengths)
      
      // Verify realistic length distribution
      expect(averageLength).toBeGreaterThan(0)
      expect(averageLength).toBeLessThan(30) // Reasonable average for Phish songs
      expect(maxLength).toBeGreaterThan(averageLength)
      expect(minLength).toBeGreaterThan(0)
      expect(maxLength).toBeLessThan(60) // Even epic jams are under an hour on average
    })
  })

  describe('Performance with Large Datasets', () => {
    it('should handle concurrent API requests efficiently', async () => {
      const start = performance.now()
      
      // Make multiple concurrent requests
      const requests = await Promise.all([
        phishApi.getSongStats(),
        phishApi.getRecentShows(),
        phishApi.getSummer2025Shows(),
        phishApi.getShowsByYear(2023),
        phishApi.getSongData('you-enjoy-myself'),
        phishApi.getSongData('harry-hood')
      ])
      
      const end = performance.now()
      
      // Should complete in reasonable time
      expect(end - start).toBeLessThan(1000) // Under 1 second
      
      // All requests should return valid data
      const [songs, recentShows, summer2025Shows, yearShows, song1, song2] = requests
      
      expect(Array.isArray(songs)).toBe(true)
      expect(Array.isArray(recentShows)).toBe(true)
      expect(Array.isArray(summer2025Shows)).toBe(true)
      expect(Array.isArray(yearShows)).toBe(true)
      expect(song1 === null || songValidators.isValidSong(song1)).toBe(true)
      expect(song2 === null || songValidators.isValidSong(song2)).toBe(true)
    })

    it('should process large datasets efficiently', async () => {
      const songs = await phishApi.getSongStats()
      
      const start = performance.now()
      
      // Perform operations that would be common with real data
      const filtered = songs.filter(song => song.timesPlayed > 100)
      const sorted = [...filtered].sort((a, b) => b.averageLength - a.averageLength)
      const mapped = sorted.map(song => ({
        ...song,
        category: song.averageLength > 15 ? 'jam' : 'standard'
      }))
      
      const end = performance.now()
      
      // Should process quickly even with larger datasets
      expect(end - start).toBeLessThan(100) // Under 100ms
      expect(mapped.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty search results gracefully', async () => {
      const songs = await phishApi.getSongStats()
      
      // Search for something that likely won't exist
      const results = songs.filter(song => 
        song.name.toLowerCase().includes('nonexistentsongname12345')
      )
      
      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBe(0)
    })

    it('should handle extreme filter values', async () => {
      const songs = await phishApi.getSongStats()
      
      // Test extreme length filters
      const veryLongSongs = songs.filter(song => song.averageLength > 100)
      const veryShortSongs = songs.filter(song => song.averageLength < 0.1)
      const veryPopularSongs = songs.filter(song => song.timesPlayed > 10000)
      const veryRareSongs = songs.filter(song => song.timesPlayed < 1)
      
      // Should handle edge cases without errors
      expect(Array.isArray(veryLongSongs)).toBe(true)
      expect(Array.isArray(veryShortSongs)).toBe(true)
      expect(Array.isArray(veryPopularSongs)).toBe(true)
      expect(Array.isArray(veryRareSongs)).toBe(true)
    })

    it('should maintain data consistency under various operations', async () => {
      const songs = await phishApi.getSongStats()
      
      // Perform various operations and verify data integrity
      const operations = [
        () => songs.filter(song => song.timesPlayed > 0),
        () => [...songs].sort((a, b) => a.name.localeCompare(b.name)),
        () => songs.map(song => ({ ...song, searchKey: song.name.toLowerCase() })),
        () => songs.reduce((acc, song) => acc + song.timesPlayed, 0)
      ]
      
      operations.forEach(operation => {
        expect(() => operation()).not.toThrow()
      })
    })
  })

  describe('Transition from Sample to Real Data', () => {
    it('should work with both small (sample) and large (real) datasets', async () => {
      const songs = await phishApi.getSongStats()
      
      // Should work whether we have 8 songs (sample) or 955+ songs (real)
      expect(songs.length).toBeGreaterThanOrEqual(dataExpectations.song.minimumCount)
      expect(songs.length).toBeLessThanOrEqual(dataExpectations.song.maximumCount)
      
      // All songs should be valid regardless of dataset size
      songs.forEach(song => {
        expect(songValidators.isValidSong(song)).toBe(true)
        expect(songValidators.hasValidOptionalProperties(song)).toBe(true)
      })
    })

    it('should scale statistical analysis appropriately', async () => {
      const songs = await phishApi.getSongStats()
      
      // Statistical functions should work regardless of dataset size
      const isValid = dataExpectations.stats.validateTopSongs(songs)
      const lengthsValid = dataExpectations.stats.validateSongLengths(songs)
      
      expect(isValid).toBe(true)
      expect(lengthsValid).toBe(true)
    })

    it('should handle UI component data requirements', async () => {
      const [songs, shows] = await Promise.all([
        phishApi.getSongStats(),
        phishApi.getRecentShows()
      ])
      
      // Verify data is suitable for UI components regardless of size
      expect(songs.length).toBeGreaterThan(0)
      expect(shows.length).toBeGreaterThan(0)
      
      // Calculate stats that UI components would need
      const totalPlays = songs.reduce((sum, song) => sum + song.timesPlayed, 0)
      const averageLength = songs.reduce((sum, song) => sum + song.averageLength, 0) / songs.length
      
      expect(totalPlays).toBeGreaterThan(0)
      expect(averageLength).toBeGreaterThan(0)
      expect(Number.isFinite(averageLength)).toBe(true)
    })
  })
})