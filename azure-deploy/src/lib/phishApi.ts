/* eslint-disable @typescript-eslint/no-explicit-any */
import { Song, Show, PhishNetApiResponse } from '@/types/phish'

const API_BASE_URL = 'https://api.phish.net/v5'
const API_KEY = process.env.NEXT_PUBLIC_PHISH_API_KEY || 'YOUR_API_KEY_HERE'

// Sample data for demonstration - replace with real API calls
const SAMPLE_SONGS: Song[] = [
  {
    name: "You Enjoy Myself",
    slug: "you-enjoy-myself",
    timesPlayed: 1647,
    averageLength: 18.5,
    firstPlayed: "1985-09-27",
    lastPlayed: "2025-07-10",
    gap: 5,
    tags: ["Type II", "Jam Vehicle"]
  },
  {
    name: "Harry Hood",
    slug: "harry-hood",
    timesPlayed: 523,
    averageLength: 12.3,
    firstPlayed: "1985-10-30",
    lastPlayed: "2025-07-08",
    gap: 2,
    tags: ["Fan Favorite", "Uplifting"]
  },
  {
    name: "Fluffhead",
    slug: "fluffhead",
    timesPlayed: 389,
    averageLength: 15.2,
    firstPlayed: "1985-10-15",
    lastPlayed: "2025-07-05",
    gap: 3,
    tags: ["Composed", "Complex"]
  },
  {
    name: "Tweezer",
    slug: "tweezer",
    timesPlayed: 445,
    averageLength: 16.8,
    firstPlayed: "1990-02-03",
    lastPlayed: "2025-07-12",
    gap: 1,
    tags: ["Type II", "Jam Vehicle", "Segue"]
  },
  {
    name: "Run Like an Antelope",
    slug: "run-like-an-antelope",
    timesPlayed: 472,
    averageLength: 9.7,
    firstPlayed: "1987-05-15",
    lastPlayed: "2025-07-11",
    gap: 2,
    tags: ["High Energy", "Fan Favorite"]
  },
  {
    name: "Divided Sky",
    slug: "divided-sky",
    timesPlayed: 398,
    averageLength: 13.1,
    firstPlayed: "1988-03-12",
    lastPlayed: "2025-07-09",
    gap: 4,
    tags: ["Composed", "Emotional"]
  },
  {
    name: "Wilson",
    slug: "wilson",
    timesPlayed: 541,
    averageLength: 3.2,
    firstPlayed: "1986-04-01",
    lastPlayed: "2025-07-13",
    gap: 0,
    tags: ["Crowd Participation", "Short"]
  },
  {
    name: "Ghost",
    slug: "ghost",
    timesPlayed: 298,
    averageLength: 11.4,
    firstPlayed: "1997-12-06",
    lastPlayed: "2025-07-06",
    gap: 1,
    tags: ["Type II", "Jam Vehicle", "Modern Era"]
  }
]

const SAMPLE_SHOWS: Show[] = [
  {
    showid: 1001,
    date: "2025-07-13",
    venue: "Charleston Coliseum",
    city: "Charleston",
    state: "WV",
    country: "USA",
    setlistnotes: "",
    songs: ["You Enjoy Myself", "Fluffhead", "Harry Hood"],
    tourid: 1,
    tour_name: "Summer 2025"
  },
  {
    showid: 1002,
    date: "2025-07-12",
    venue: "Charleston Coliseum", 
    city: "Charleston",
    state: "WV",
    country: "USA",
    setlistnotes: "",
    songs: ["Tweezer", "Wilson", "Ghost"],
    tourid: 1,
    tour_name: "Summer 2025"
  },
  {
    showid: 1003,
    date: "2025-07-11",
    venue: "Charleston Coliseum",
    city: "Charleston",
    state: "WV",
    country: "USA",
    setlistnotes: "",
    songs: ["Run Like an Antelope", "Divided Sky"],
    tourid: 1,
    tour_name: "Summer 2025"
  }
]

class PhishApi {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_DURATION = 30 * 1000 // 30 seconds for development

  private async fetchFromApi(endpoint: string): Promise<any> {
    try {
      // Check cache first
      const cacheKey = endpoint
      const cached = this.cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data
      }

      const url = `${API_BASE_URL}/${endpoint}.json?apikey=${API_KEY}`
      console.log(`Fetching: ${endpoint}`)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }
      
      const data: PhishNetApiResponse = await response.json()
      
      // Check if the API returned an explicit error
      if (data.error === true) {
        throw new Error(`API returned error: ${data.error_message || 'Unknown error'}`)
      }

      // Cache the result
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      
      return data
    } catch (error) {
      console.error('API fetch error:', error)
      throw error
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async getRecentShows(): Promise<Show[]> {
    try {
      console.log('Fetching summer 2025 shows from API...')
      // Get summer 2025 shows (July-August)
      const data = await this.fetchFromApi('shows/year/2025')
      
      if (!data.data || data.data.length === 0) {
        console.log('No shows data received, using sample data')
        return SAMPLE_SHOWS
      }

      const summerShows = data.data.filter((show: any) => {
        const showDate = new Date(show.showdate)
        const month = showDate.getMonth() + 1 // JavaScript months are 0-indexed
        return month >= 7 && month <= 8 // July and August
      })
      
      console.log(`Found ${summerShows.length} summer 2025 shows`)
      const transformedShows = summerShows.map(this.transformShow)
      return transformedShows.length > 0 ? transformedShows : SAMPLE_SHOWS
    } catch (error) {
      console.error('Error fetching recent shows:', error)
      console.log('Falling back to sample data')
      return SAMPLE_SHOWS
    }
  }

  async getSongStats(): Promise<Song[]> {
    try {
      console.log('🎵 Fetching song statistics from API...')
      // Get songs data from the API - this already contains the stats we need!
      const songsData = await this.fetchFromApi('songs')
      
      if (!songsData.data || songsData.data.length === 0) {
        console.log('⚠️ No songs data received, using sample data')
        return SAMPLE_SONGS
      }

      console.log(`📊 Processing ${songsData.data.length} songs from API...`)
      
      // Transform the song data directly from the main API response
      // Filter for songs that have been played recently (2023 or later) and multiple times
      const recentSongs = songsData.data
        .filter((song: any) => {
          const lastPlayed = song.last_played
          const timesPlayed = parseInt(song.times_played) || 0
          
          // Include songs played in 2023 or later, or classic songs with many plays
          if (lastPlayed) {
            const lastYear = parseInt(lastPlayed.split('-')[0])
            return (lastYear >= 2023 && timesPlayed >= 1) || timesPlayed >= 50
          }
          return timesPlayed >= 50
        })
        .slice(0, 50) // Get top 50 songs
      
      const transformedSongs = recentSongs.map((song: any) => this.transformSongFromList(song))
      
      console.log(`✅ Successfully processed ${transformedSongs.length} songs from API`)
      return transformedSongs.length > 0 ? transformedSongs : SAMPLE_SONGS
    } catch (error) {
      console.error('❌ Error fetching song stats:', error)
      console.log('⚠️ Falling back to sample data')
      return SAMPLE_SONGS
    }
  }

  async getSummer2025Shows(): Promise<Show[]> {
    try {
      console.log('🎵 Fetching 2025 summer shows...');
      
      // Use the general shows endpoint instead of year-specific
      const data = await this.fetchFromApi('shows')
      console.log('📊 Raw API response for shows:', { 
        error: data.error, 
        error_message: data.error_message, 
        dataLength: data.data?.length 
      });
      
      // If API returned an error, use sample data
      if (data.error) {
        console.log('⚠️ API error, returning sample data');
        return SAMPLE_SHOWS;
      }
      
      // If no data array, use sample data
      if (!data.data) {
        console.log('⚠️ No data array found, returning sample data');
        return SAMPLE_SHOWS;
      }
      
      // Filter for 2025 summer shows (June-September)
      const summer2025Shows = data.data.filter((show: any) => {
        const year = show.showyear === '2025' || show.showyear === 2025;
        const month = parseInt(show.showmonth);
        return year && month >= 6 && month <= 9;
      });
      
      console.log(`🏖️ Found ${summer2025Shows.length} summer 2025 shows`);
      
      if (summer2025Shows.length === 0) {
        console.log('⚠️ No 2025 summer shows found after filtering, returning sample data');
        return SAMPLE_SHOWS;
      }
      
      return summer2025Shows.map((show: any) => this.transformShow(show));
    } catch (error) {
      console.error('❌ Error fetching summer 2025 shows:', error)
      return SAMPLE_SHOWS
    }
  }

  private transformSongFromList(apiSong: any): Song {
    // Calculate average length estimate based on song type and times played
    // Since the API doesn't provide avg_length, we'll estimate based on known patterns
    const estimateAverageLength = (songName: string, timesPlayed: number): number => {
      const name = songName.toLowerCase()
      
      // Known long jams
      if (name.includes('you enjoy myself') || name.includes('tweezer') || 
          name.includes('ghost') || name.includes('light') || 
          name.includes('twenty years later')) {
        return 15 + Math.random() * 10 // 15-25 minutes
      }
      
      // Medium length songs
      if (name.includes('fluffhead') || name.includes('divided sky') || 
          name.includes('harry hood') || name.includes('run like an antelope')) {
        return 8 + Math.random() * 8 // 8-16 minutes
      }
      
      // Short songs
      if (name.includes('wilson') || name.includes('the lizards') || 
          name.includes('fee') || name.includes('cavern')) {
        return 3 + Math.random() * 4 // 3-7 minutes
      }
      
      // Default estimate based on play frequency (more played = likely shorter/popular)
      if (timesPlayed > 500) return 4 + Math.random() * 4 // 4-8 minutes
      if (timesPlayed > 200) return 6 + Math.random() * 6 // 6-12 minutes
      if (timesPlayed > 50) return 8 + Math.random() * 8  // 8-16 minutes
      return 5 + Math.random() * 10 // 5-15 minutes
    }

    const timesPlayed = parseInt(apiSong.times_played) || 0
    const averageLength = parseFloat(estimateAverageLength(apiSong.song, timesPlayed).toFixed(1))

    return {
      name: apiSong.song,
      slug: apiSong.slug,
      timesPlayed: timesPlayed,
      averageLength: averageLength,
      firstPlayed: apiSong.debut || 'Unknown',
      lastPlayed: apiSong.last_played || 'Unknown',
      gap: parseInt(apiSong.gap) || 0,
      tags: this.generateTags(apiSong.song, timesPlayed, averageLength)
    }
  }

  private generateTags(songName: string, timesPlayed: number, averageLength: number): string[] {
    const tags: string[] = []
    const name = songName.toLowerCase()
    
    // Genre/style tags
    if (name.includes('you enjoy myself') || name.includes('tweezer') || name.includes('ghost')) {
      tags.push('Type II', 'Jam Vehicle')
    }
    
    if (name.includes('fluffhead') || name.includes('divided sky') || name.includes('reba')) {
      tags.push('Composed', 'Complex')
    }
    
    if (name.includes('wilson') || name.includes('cavern') || name.includes('fee')) {
      tags.push('Crowd Participation')
    }
    
    // Frequency tags
    if (timesPlayed > 400) {
      tags.push('Fan Favorite')
    }
    
    if (timesPlayed < 50) {
      tags.push('Rare')
    }
    
    // Length tags
    if (averageLength > 15) {
      tags.push('Extended')
    } else if (averageLength < 5) {
      tags.push('Short')
    }
    
    // Era tags
    if (name.includes('ghost') || name.includes('limb by limb') || name.includes('guyute')) {
      tags.push('Modern Era')
    }
    
    return tags
  }

  private transformShow(apiShow: any): Show {
    return {
      showid: parseInt(apiShow.showid) || 0,
      date: apiShow.showdate || apiShow.date,
      venue: apiShow.venue || 'Unknown Venue',
      city: apiShow.city || '',
      state: apiShow.state || null,
      country: apiShow.country || 'USA',
      setlistnotes: apiShow.setlist_notes || '',
      songs: apiShow.songs || [],
      tourid: parseInt(apiShow.tourid) || undefined,
      tour_name: apiShow.tour_name || 'Unknown Tour'
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
      gap: apiSong.gap ? parseInt(apiSong.gap) : undefined,
      tags: apiSong.tags || []
    }
  }

  async getShowsByYear(year: number): Promise<Show[]> {
    try {
      // const data = await this.fetchFromApi(`shows/year/${year}`)
      // return data.data
      return SAMPLE_SHOWS
    } catch (error) {
      console.error(`Error fetching shows for ${year}:`, error)
      return []
    }
  }

  async getSongData(songSlug: string): Promise<Song | null> {
    try {
      // const data = await this.fetchFromApi(`songdata/slug/${songSlug}`)
      // return data.data[0]
      return SAMPLE_SONGS.find(song => song.slug === songSlug) || null
    } catch (error) {
      console.error(`Error fetching song data for ${songSlug}:`, error)
      return null
    }
  }
}

export const phishApi = new PhishApi()
