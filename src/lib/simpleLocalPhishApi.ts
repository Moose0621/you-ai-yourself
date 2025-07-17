import { Song, Show } from '@/types/phish'

/**
 * Simple Local Phish API - Uses fetch for better browser compatibility
 */
class SimpleLocalPhishApi {
  private songs: Song[] = []
  private shows: Show[] = []
  private initialized = false

  constructor() {
    // We'll initialize data on first request for better compatibility
  }

  private async initializeData(): Promise<void> {
    if (this.initialized) return

    try {
      console.log('🔄 Fetching processed data...')
      
      // Check if we're in server or client context
      const isServer = typeof window === 'undefined'
      
      if (isServer) {
        // Server-side: use direct import for better compatibility
        const processedData = await import('../../public/processed-data.json')
        this.songs = processedData.default.songs as Song[]
        this.shows = processedData.default.shows as Show[]
        this.initialized = true
        console.log('✅ Server: Initialized with direct import -', this.songs.length, 'songs and', this.shows.length, 'shows')
      } else {
        // Client-side: use fetch with timeout for better browser compatibility
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        try {
          const response = await fetch('/processed-data.json', {
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache',
              'Content-Type': 'application/json'
            }
          })
          clearTimeout(timeoutId)
          
          if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`)
          }
          
          console.log('📊 Parsing JSON data...')
          const processedData = await response.json()
          
          this.songs = processedData.songs as Song[]
          this.shows = processedData.shows as Show[]
          this.initialized = true
          
          console.log('✅ Client: Initialized with fetch -', this.songs.length, 'songs and', this.shows.length, 'shows')
        } catch (fetchError) {
          clearTimeout(timeoutId)
          throw fetchError
        }
      }
    } catch (error) {
      console.error('❌ Failed to initialize data:', error)
      // Fallback: try to import directly if fetch fails
      try {
        console.log('🔄 Trying fallback import...')
        const processedData = await import('../../public/processed-data.json')
        this.songs = processedData.default.songs as Song[]
        this.shows = processedData.default.shows as Show[]
        this.initialized = true
        console.log('✅ Fallback: Initialized with direct import')
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError)
        throw new Error('Unable to load Phish data. Please refresh the page.')
      }
    }
  }

  /**
   * Get all song statistics
   */
  async getSongStats(): Promise<Song[]> {
    await this.initializeData()
    console.log('📊 Loading songs from local cache...')
    return this.songs
  }

  /**
   * Get shows from the summer 2025 tour (July-September)
   */
  async getSummer2025Shows(): Promise<Show[]> {
    await this.initializeData()
    console.log('🎪 Loading 2025 summer shows from local cache...')
    
    const summer2025Shows = this.shows.filter(show => {
      const date = new Date(show.date)
      const year = date.getFullYear()
      const month = date.getMonth() + 1 // JavaScript months are 0-indexed
      
      return year === 2025 && month >= 7 && month <= 9
    })
    
    console.log(`✅ Found ${summer2025Shows.length} summer 2025 shows`)
    return summer2025Shows
  }

  /**
   * Get all shows for a specific year
   */
  async getShowsByYear(year: number): Promise<Show[]> {
    await this.initializeData()
    console.log(`🎪 Loading ${year} shows from local cache...`)
    
    const yearShows = this.shows.filter(show => {
      const showYear = new Date(show.date).getFullYear()
      return showYear === year
    })
    
    console.log(`✅ Found ${yearShows.length} shows in ${year}`)
    return yearShows
  }

  /**
   * Search songs by name
   */
  async searchSongs(query: string): Promise<Song[]> {
    await this.initializeData()
    const normalizedQuery = query.toLowerCase()
    
    return this.songs.filter(song => 
      song.name.toLowerCase().includes(normalizedQuery)
    )
  }

  /**
   * Get top songs by play count
   */
  async getTopSongsByPlayCount(limit: number = 20): Promise<Song[]> {
    await this.initializeData()
    return [...this.songs]
      .sort((a, b) => b.timesPlayed - a.timesPlayed)
      .slice(0, limit)
  }

  /**
   * Get top songs by average length
   */
  async getTopSongsByLength(limit: number = 20): Promise<Song[]> {
    return [...this.songs]
      .filter(song => song.averageLength != null && song.averageLength > 0)
      .sort((a, b) => (b.averageLength || 0) - (a.averageLength || 0))
      .slice(0, limit)
  }

  /**
   * Get top songs by longest jam
   */
  async getTopSongsByLongestJam(limit: number = 20): Promise<Song[]> {
    return [...this.songs]
      .filter(song => song.longestJam && song.longestJam.length > 0)
      .sort((a, b) => (b.longestJam?.length || 0) - (a.longestJam?.length || 0))
      .slice(0, limit)
  }

  /**
   * Get songs by tag
   */
  async getSongsByTag(tag: string): Promise<Song[]> {
    return this.songs.filter(song => 
      song.tags && song.tags.includes(tag)
    )
  }

  /**
   * Get all available tags
   */
  async getAllTags(): Promise<string[]> {
    const tagSet = new Set<string>()
    
    this.songs.forEach(song => {
      if (song.tags) {
        song.tags.forEach(tag => tagSet.add(tag))
      }
    })
    
    return Array.from(tagSet).sort()
  }

  /**
   * Get all tours grouped by year
   */
  async getToursByYear(): Promise<Record<number, Array<{id: number, name: string, showCount: number, shows: Show[]}>>> {
    console.log('🎪 Loading tours grouped by year from local cache...')
    
    const toursByYear: Record<number, Record<number, {id: number, name: string, shows: Show[]}>> = {}
    
    this.shows.forEach(show => {
      const year = new Date(show.date).getFullYear()
      const tourId = show.tourid || 0
      const tourName = show.tour_name || 'Unknown Tour'
      
      if (!toursByYear[year]) {
        toursByYear[year] = {}
      }
      
      if (!toursByYear[year][tourId]) {
        toursByYear[year][tourId] = {
          id: tourId,
          name: tourName,
          shows: []
        }
      }
      
      toursByYear[year][tourId].shows.push(show)
    })
    
    // Convert to the desired format
    const result: Record<number, Array<{id: number, name: string, showCount: number, shows: Show[]}>> = {}
    
    Object.keys(toursByYear).forEach(yearStr => {
      const year = parseInt(yearStr)
      result[year] = Object.values(toursByYear[year]).map(tour => ({
        ...tour,
        showCount: tour.shows.length
      })).sort((a, b) => a.id - b.id)
    })
    
    console.log(`✅ Found tours across ${Object.keys(result).length} years`)
    return result
  }

  /**
   * Get all unique years with shows
   */
  async getAvailableYears(): Promise<number[]> {
    const years = new Set<number>()
    
    this.shows.forEach(show => {
      const year = new Date(show.date).getFullYear()
      years.add(year)
    })
    
    return Array.from(years).sort((a, b) => b - a) // Most recent first
  }

  /**
   * Get metadata about the dataset
   */
  async getMetadata() {
    return {
      totalSongs: this.songs.length,
      totalShows: this.shows.length,
      lastUpdated: new Date().toISOString(),
      dataSource: 'phish.net API v5 (local cache)'
    }
  }
}

// Export singleton instance
export const simpleLocalPhishApi = new SimpleLocalPhishApi()

// Export with the same interface as before
export const phishApi = {
  getSongStats: () => simpleLocalPhishApi.getSongStats(),
  getSummer2025Shows: () => simpleLocalPhishApi.getSummer2025Shows(),
  getShowsByYear: (year: number) => simpleLocalPhishApi.getShowsByYear(year),
  getToursByYear: () => simpleLocalPhishApi.getToursByYear(),
  getAvailableYears: () => simpleLocalPhishApi.getAvailableYears(),
  searchSongs: (query: string) => simpleLocalPhishApi.searchSongs(query),
  getTopSongsByPlayCount: (limit?: number) => simpleLocalPhishApi.getTopSongsByPlayCount(limit),
  getTopSongsByLength: (limit?: number) => simpleLocalPhishApi.getTopSongsByLength(limit),
  getTopSongsByLongestJam: (limit?: number) => simpleLocalPhishApi.getTopSongsByLongestJam(limit),
  getSongsByTag: (tag: string) => simpleLocalPhishApi.getSongsByTag(tag),
  getAllTags: () => simpleLocalPhishApi.getAllTags(),
  getMetadata: () => simpleLocalPhishApi.getMetadata()
}
