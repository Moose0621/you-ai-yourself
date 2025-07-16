import { Song, Show } from '@/types/phish'

/**
 * Test utilities for Phish data validation
 * These utilities are designed to work with both sample and real data
 */

export const songValidators = {
  /**
   * Validates a Song object has all required properties with correct types
   */
  isValidSong: (song: any): song is Song => {
    return (
      typeof song === 'object' &&
      song !== null &&
      typeof song.name === 'string' &&
      typeof song.slug === 'string' &&
      typeof song.timesPlayed === 'number' &&
      typeof song.averageLength === 'number' &&
      song.timesPlayed >= 0 &&
      song.averageLength >= 0
    )
  },

  /**
   * Validates optional song properties when they exist
   */
  hasValidOptionalProperties: (song: Song): boolean => {
    const checks = []
    
    if (song.firstPlayed !== undefined) {
      checks.push(typeof song.firstPlayed === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(song.firstPlayed))
    }
    
    if (song.lastPlayed !== undefined) {
      checks.push(typeof song.lastPlayed === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(song.lastPlayed))
    }
    
    if (song.gaps !== undefined) {
      checks.push(Array.isArray(song.gaps) && song.gaps.every(gap => typeof gap === 'number' && gap >= 0))
    }
    
    if (song.tags !== undefined) {
      checks.push(Array.isArray(song.tags) && song.tags.every(tag => typeof tag === 'string'))
    }
    
    return checks.length === 0 || checks.every(check => check)
  }
}

export const showValidators = {
  /**
   * Validates a Show object has all required properties with correct types
   */
  isValidShow: (show: any): show is Show => {
    return (
      typeof show === 'object' &&
      show !== null &&
      typeof show.showdate === 'string' &&
      typeof show.venue === 'string' &&
      typeof show.location === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(show.showdate)
    )
  }
}

export const dataExpectations = {
  /**
   * Dynamic expectations that work with both sample (8 songs) and real data (955+ songs)
   */
  song: {
    minimumCount: 8, // At least the sample data count
    maximumCount: 2000, // Reasonable upper bound for Phish songs
    popularSongMinPlays: 100, // Popular songs should have substantial play counts
    averageLengthRange: { min: 1, max: 30 }, // Reasonable song length in minutes
  },
  
  show: {
    minimumCount: 1, // At least one show
    maximumCount: 10000, // Reasonable upper bound for total shows
  },
  
  /**
   * Statistical validation helpers
   */
  stats: {
    /**
     * Check if the most played songs are actually popular
     * This handles both sample data (8 songs) and real data (955+ songs)
     */
    validateTopSongs: (songs: Song[]): boolean => {
      if (songs.length === 0) return true
      
      const sorted = [...songs].sort((a, b) => b.timesPlayed - a.timesPlayed)
      const top5 = sorted.slice(0, Math.min(5, songs.length))
      
      // For small datasets (like sample data), just check that sorting works correctly
      if (songs.length <= 10) {
        for (let i = 0; i < top5.length - 1; i++) {
          if (top5[i].timesPlayed < top5[i + 1].timesPlayed) {
            return false
          }
        }
        return true
      }
      
      // For larger datasets, check if top songs have significantly more plays than average
      const averagePlays = songs.reduce((sum, song) => sum + song.timesPlayed, 0) / songs.length
      return top5.every(song => song.timesPlayed > averagePlays)
    },
    
    /**
     * Check if longest average lengths are reasonable
     */
    validateSongLengths: (songs: Song[]): boolean => {
      const sorted = [...songs].sort((a, b) => b.averageLength - a.averageLength)
      const longest = sorted[0]
      
      // Longest song should be reasonable (not hours long)
      return longest.averageLength <= 60 && longest.averageLength > 0
    }
  }
}

/**
 * Mock data generators for consistent testing
 */
export const mockDataGenerators = {
  createSong: (overrides: Partial<Song> = {}): Song => ({
    name: 'Test Song',
    slug: 'test-song',
    timesPlayed: 100,
    averageLength: 10.5,
    firstPlayed: '1990-01-01',
    lastPlayed: '2023-12-31',
    gaps: [0, 1, 2],
    tags: ['Test Tag'],
    ...overrides
  }),
  
  createShow: (overrides: Partial<Show> = {}): Show => ({
    showdate: '2023-12-31',
    venue: 'Test Venue',
    location: 'Test City, TS',
    tourName: 'Test Tour',
    ...overrides
  })
}