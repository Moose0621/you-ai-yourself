import { Song, Show } from '@/types/phish'

/**
 * Local Phish API - Uses locally cached data instead of external API calls
 */
class LocalPhishApi {
  private songs: Song[] = []
  private shows: Show[] = []
  private initialized = false

  private async initialize() {
    if (this.initialized) return

    try {
      // For client-side, use relative URL. For server-side, we'll import directly
      let processedData
      
      if (typeof window !== 'undefined') {
        // Client-side: fetch from the public directory
        const response = await fetch('/processed-data.json')
        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.statusText}`)
        }
        processedData = await response.json()
      } else {
        // Server-side: import the data directly (for SSR)
        try {
          const fs = await import('fs')
          const path = await import('path')
          const dataPath = path.join(process.cwd(), 'public', 'processed-data.json')
          const fileContent = fs.readFileSync(dataPath, 'utf8')
          processedData = JSON.parse(fileContent)
        } catch {
          // Fallback: try to fetch during SSR (though this might not work)
          console.warn('Failed to read file directly, falling back to fetch')
          throw new Error('Cannot load data during SSR without proper file access')
        }
      }
      
      this.songs = processedData.songs as Song[]
      this.shows = processedData.shows as Show[]
      this.initialized = true
      
      console.log('✅ Initialized local cache with', this.songs.length, 'songs and', this.shows.length, 'shows')
    } catch (error) {
      console.error('❌ Failed to initialize local cache:', error)
      // Fallback to empty arrays
      this.songs = []
      this.shows = []
      this.initialized = true
    }
  }

  /**
   * Get all song statistics
   */
  async getSongStats(): Promise<Song[]> {
    await this.initialize()
    console.log('📊 Loading songs from local cache...')
    console.log(`✅ Loaded ${this.songs.length} songs from cache`)
    return this.songs
  }

  /**
   * Get shows from the summer 2025 tour (July-September)
   */
  async getSummer2025Shows(): Promise<Show[]> {
    await this.initialize()
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
    await this.initialize()
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
    await this.initialize()
    const normalizedQuery = query.toLowerCase()
    
    return this.songs.filter(song => 
      song.name.toLowerCase().includes(normalizedQuery)
    )
  }

  /**
   * Get top songs by play count
   */
  async getTopSongsByPlayCount(limit: number = 20): Promise<Song[]> {
    await this.initialize()
    return [...this.songs]
      .sort((a, b) => b.timesPlayed - a.timesPlayed)
      .slice(0, limit)
  }

  /**
   * Get top songs by average length
   */
  async getTopSongsByLength(limit: number = 20): Promise<Song[]> {
    await this.initialize()
    return [...this.songs]
      .sort((a, b) => b.averageLength - a.averageLength)
      .slice(0, limit)
  }

  /**
   * Get songs by tag
   */
  async getSongsByTag(tag: string): Promise<Song[]> {
    await this.initialize()
    return this.songs.filter(song => 
      song.tags && song.tags.includes(tag)
    )
  }

  /**
   * Get all available tags
   */
  async getAllTags(): Promise<string[]> {
    await this.initialize()
    const tagSet = new Set<string>()
    
    this.songs.forEach(song => {
      if (song.tags) {
        song.tags.forEach(tag => tagSet.add(tag))
      }
    })
    
    return Array.from(tagSet).sort()
  }

  /**
   * Get metadata about the dataset
   */
  async getMetadata() {
    await this.initialize()
    return {
      totalSongs: this.songs.length,
      totalShows: this.shows.length,
      lastUpdated: new Date().toISOString(),
      dataSource: 'phish.net API v5 (local cache)'
    }
  }
}

// Export singleton instance
export const localPhishApi = new LocalPhishApi()

// Keep the old interface for backward compatibility
export const phishApi = {
  getSongStats: () => localPhishApi.getSongStats(),
  getSummer2025Shows: () => localPhishApi.getSummer2025Shows(),
  // Add additional methods as needed
  getShowsByYear: (year: number) => localPhishApi.getShowsByYear(year),
  searchSongs: (query: string) => localPhishApi.searchSongs(query),
  getTopSongsByPlayCount: (limit?: number) => localPhishApi.getTopSongsByPlayCount(limit),
  getTopSongsByLength: (limit?: number) => localPhishApi.getTopSongsByLength(limit),
  getSongsByTag: (tag: string) => localPhishApi.getSongsByTag(tag),
  getAllTags: () => localPhishApi.getAllTags(),
  getMetadata: () => localPhishApi.getMetadata()
}
