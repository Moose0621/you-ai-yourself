import { Song, Show, PhishNetApiResponse } from '@/types/phish'
import { apiCache, generateCacheKey, performanceMonitor } from './cache'

const API_BASE_URL = 'https://api.phish.net/v5'
const API_KEY = process.env.NEXT_PUBLIC_PHISH_API_KEY || 'YOUR_API_KEY_HERE'

// Cache configuration
const CACHE_TTL = {
  SONGS: 24 * 60 * 60 * 1000, // 24 hours
  SHOWS: 6 * 60 * 60 * 1000,  // 6 hours
  SONG_DETAIL: 24 * 60 * 60 * 1000 // 24 hours
}

// Sample data for demonstration - replace with real API calls
const SAMPLE_SONGS: Song[] = [
  {
    name: "You Enjoy Myself",
    slug: "you-enjoy-myself",
    timesPlayed: 1647,
    averageLength: 18.5,
    firstPlayed: "1985-09-27",
    lastPlayed: "2025-07-10",
    gaps: [0, 1, 2, 3, 4, 5],
    tags: ["Type II", "Jam Vehicle"]
  },
  {
    name: "Harry Hood",
    slug: "harry-hood",
    timesPlayed: 523,
    averageLength: 12.3,
    firstPlayed: "1985-10-30",
    lastPlayed: "2025-07-08",
    gaps: [0, 1, 2, 3],
    tags: ["Fan Favorite", "Uplifting"]
  },
  {
    name: "Fluffhead",
    slug: "fluffhead",
    timesPlayed: 389,
    averageLength: 15.2,
    firstPlayed: "1985-10-15",
    lastPlayed: "2025-07-05",
    gaps: [0, 1, 2, 3, 4],
    tags: ["Composed", "Complex"]
  },
  {
    name: "Tweezer",
    slug: "tweezer",
    timesPlayed: 445,
    averageLength: 16.8,
    firstPlayed: "1990-02-03",
    lastPlayed: "2025-07-12",
    gaps: [0, 1, 2],
    tags: ["Type II", "Jam Vehicle", "Segue"]
  },
  {
    name: "Run Like an Antelope",
    slug: "run-like-an-antelope",
    timesPlayed: 472,
    averageLength: 9.7,
    firstPlayed: "1987-05-15",
    lastPlayed: "2025-07-11",
    gaps: [0, 1, 2, 3],
    tags: ["High Energy", "Fan Favorite"]
  },
  {
    name: "Divided Sky",
    slug: "divided-sky",
    timesPlayed: 398,
    averageLength: 13.1,
    firstPlayed: "1988-03-12",
    lastPlayed: "2025-07-09",
    gaps: [0, 1, 2, 3, 4],
    tags: ["Composed", "Emotional"]
  },
  {
    name: "Wilson",
    slug: "wilson",
    timesPlayed: 541,
    averageLength: 3.2,
    firstPlayed: "1986-04-01",
    lastPlayed: "2025-07-13",
    gaps: [0, 1],
    tags: ["Crowd Participation", "Short"]
  },
  {
    name: "Ghost",
    slug: "ghost",
    timesPlayed: 298,
    averageLength: 11.4,
    firstPlayed: "1997-12-06",
    lastPlayed: "2025-07-06",
    gaps: [0, 1, 2, 3],
    tags: ["Type II", "Jam Vehicle", "Modern Era"]
  }
]

const SAMPLE_SHOWS: Show[] = [
  {
    showdate: "2025-07-13",
    venue: "Charleston Coliseum",
    location: "Charleston, WV",
    tourName: "Summer 2025"
  },
  {
    showdate: "2025-07-12",
    venue: "Charleston Coliseum", 
    location: "Charleston, WV",
    tourName: "Summer 2025"
  },
  {
    showdate: "2025-07-11",
    venue: "Charleston Coliseum",
    location: "Charleston, WV", 
    tourName: "Summer 2025"
  }
]

class PhishApi {
  private async fetchFromApi(endpoint: string, params?: Record<string, any>): Promise<any> {
    // Generate cache key
    const cacheKey = generateCacheKey.apiCall(endpoint, params)
    
    // Check cache first
    const cached = apiCache.get(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const url = `${API_BASE_URL}/${endpoint}.json?apikey=${API_KEY}`
      
      const response = await performanceMonitor.measureAsync(
        `api:${endpoint}`,
        () => fetch(url)
      )
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }
      
      const data: PhishNetApiResponse = await response.json()
      
      // Cache the response
      apiCache.set(cacheKey, data, CACHE_TTL.SHOWS)
      
      return data
    } catch (error) {
      console.error('API fetch error:', error)
      throw error
    }
  }

  async getRecentShows(): Promise<Show[]> {
    const cacheKey = 'recent-shows'
    
    try {
      // Check cache first
      const cached = apiCache.get(cacheKey)
      if (cached) {
        return cached
      }

      // Uncomment the following lines when you have a valid API key
      // const data = await this.fetchFromApi('shows/recent')
      // const shows = data.data.map(this.transformShow)
      
      // For now, return sample data with caching
      const shows = await performanceMonitor.measureAsync(
        'load-sample-shows',
        async () => {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 100))
          return SAMPLE_SHOWS
        }
      )
      
      // Cache the result
      apiCache.set(cacheKey, shows, CACHE_TTL.SHOWS)
      
      return shows
    } catch (error) {
      console.error('Error fetching recent shows:', error)
      // Return cached data if available, otherwise fallback
      const cached = apiCache.get(cacheKey)
      return cached || SAMPLE_SHOWS
    }
  }

  async getSongStats(): Promise<Song[]> {
    const cacheKey = 'song-stats'
    
    try {
      // Check cache first
      const cached = apiCache.get(cacheKey)
      if (cached) {
        return cached
      }

      // Uncomment the following lines when you have a valid API key
      // const songsData = await this.fetchFromApi('songs')
      // const songs = await Promise.all(
      //   songsData.data.slice(0, 50).map(async (song: any) => {
      //     const songDetail = await this.fetchFromApi(`songdata/slug/${song.slug}`)
      //     return this.transformSong(songDetail.data[0])
      //   })
      // )
      // return songs
      
      // For now, return sample data with caching
      const songs = await performanceMonitor.measureAsync(
        'load-sample-songs',
        async () => {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 150))
          return SAMPLE_SONGS
        }
      )
      
      // Cache the result
      apiCache.set(cacheKey, songs, CACHE_TTL.SONGS)
      
      return songs
    } catch (error) {
      console.error('Error fetching song stats:', error)
      // Return cached data if available, otherwise fallback
      const cached = apiCache.get(cacheKey)
      return cached || SAMPLE_SONGS
    }
  }

  async getSummer2025Shows(): Promise<Show[]> {
    const cacheKey = 'summer-2025-shows'
    
    try {
      // Check cache first
      const cached = apiCache.get(cacheKey)
      if (cached) {
        return cached
      }

      // Get shows from summer 2025 (adjust dates as needed)
      // const data = await this.fetchFromApi('shows/showdate/2025-07-01/2025-07-31')
      // const shows = data.data.map(this.transformShow)
      
      const shows = await performanceMonitor.measureAsync(
        'load-summer-shows',
        async () => {
          await new Promise(resolve => setTimeout(resolve, 80))
          return SAMPLE_SHOWS
        }
      )
      
      // Cache the result
      apiCache.set(cacheKey, shows, CACHE_TTL.SHOWS)
      
      return shows
    } catch (error) {
      console.error('Error fetching summer 2025 shows:', error)
      const cached = apiCache.get(cacheKey)
      return cached || SAMPLE_SHOWS
    }
  }

  private transformShow(apiShow: any): Show {
    return {
      showdate: apiShow.showdate,
      venue: apiShow.venue?.name || 'Unknown Venue',
      location: `${apiShow.venue?.city || ''}, ${apiShow.venue?.state || apiShow.venue?.country || ''}`.trim(),
      setlistdata: apiShow.setlistdata,
      tourName: apiShow.tour_name || 'Unknown Tour'
    }
  }

  private transformSong(apiSong: any): Song {
    return {
      name: apiSong.song,
      slug: apiSong.slug,
      timesPlayed: parseInt(apiSong.times_played) || 0,
      averageLength: parseFloat(apiSong.avg_length) || 0,
      firstPlayed: apiSong.first_played,
      lastPlayed: apiSong.last_played,
      gaps: apiSong.gaps ? apiSong.gaps.map((g: any) => parseInt(g)) : [],
      tags: apiSong.tags || []
    }
  }

  async getShowsByYear(year: number): Promise<Show[]> {
    const cacheKey = `shows-${year}`
    
    try {
      // Check cache first
      const cached = apiCache.get(cacheKey)
      if (cached) {
        return cached
      }

      // const data = await this.fetchFromApi(`shows/year/${year}`)
      // const shows = data.data.map(this.transformShow)
      
      const shows = await performanceMonitor.measureAsync(
        `load-shows-${year}`,
        async () => {
          await new Promise(resolve => setTimeout(resolve, 60))
          return SAMPLE_SHOWS
        }
      )
      
      // Cache the result
      apiCache.set(cacheKey, shows, CACHE_TTL.SHOWS)
      
      return shows
    } catch (error) {
      console.error(`Error fetching shows for ${year}:`, error)
      const cached = apiCache.get(cacheKey)
      return cached || []
    }
  }

  async getSongData(songSlug: string): Promise<Song | null> {
    const cacheKey = `song-${songSlug}`
    
    try {
      // Check cache first
      const cached = apiCache.get(cacheKey)
      if (cached) {
        return cached
      }

      // const data = await this.fetchFromApi(`songdata/slug/${songSlug}`)
      // const song = this.transformSong(data.data[0])
      
      const song = await performanceMonitor.measureAsync(
        `load-song-${songSlug}`,
        async () => {
          await new Promise(resolve => setTimeout(resolve, 30))
          return SAMPLE_SONGS.find(song => song.slug === songSlug) || null
        }
      )
      
      // Cache the result
      if (song) {
        apiCache.set(cacheKey, song, CACHE_TTL.SONG_DETAIL)
      }
      
      return song
    } catch (error) {
      console.error(`Error fetching song data for ${songSlug}:`, error)
      const cached = apiCache.get(cacheKey)
      return cached || null
    }
  }

  // Cache management methods
  clearCache(): void {
    apiCache.clear()
  }

  invalidateCache(pattern?: string): number {
    if (pattern) {
      return apiCache.invalidatePattern(pattern)
    } else {
      apiCache.clear()
      return 0
    }
  }

  getCacheStats() {
    return apiCache.getStats()
  }
}

export const phishApi = new PhishApi()
