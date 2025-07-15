import { Song, Show, PhishNetApiResponse } from '@/types/phish'
import { trackDependency, trackError } from '@/lib/appInsights'

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
  private async fetchFromApi(endpoint: string): Promise<any> {
    const startTime = performance.now()
    const url = `${API_BASE_URL}/${endpoint}.json?apikey=${API_KEY}`
    
    try {
      const response = await fetch(url)
      const duration = performance.now() - startTime
      
      if (!response.ok) {
        // Track failed API call
        trackDependency(
          endpoint,
          `GET ${url}`,
          duration,
          false,
          {
            statusCode: response.status.toString(),
            statusText: response.statusText,
            endpoint
          }
        )
        throw new Error(`API request failed: ${response.statusText}`)
      }
      
      const data: PhishNetApiResponse = await response.json()
      
      // Track successful API call
      trackDependency(
        endpoint,
        `GET ${url}`,
        duration,
        true,
        {
          statusCode: response.status.toString(),
          dataSize: JSON.stringify(data).length,
          endpoint,
          resultCount: data.data?.length || 0
        }
      )
      
      return data
    } catch (error) {
      const duration = performance.now() - startTime
      
      // Track error in API call
      trackDependency(
        endpoint,
        `GET ${url}`,
        duration,
        false,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          endpoint
        }
      )
      
      if (error instanceof Error) {
        trackError(error, {
          context: 'phish_api_fetch',
          endpoint,
          url
        })
      }
      
      console.error('API fetch error:', error)
      throw error
    }
  }

  async getRecentShows(): Promise<Show[]> {
    try {
      // Uncomment the following lines when you have a valid API key
      // const data = await this.fetchFromApi('shows/recent')
      // return data.data.map(this.transformShow)
      
      // For now, return sample data
      return SAMPLE_SHOWS
    } catch (error) {
      console.error('Error fetching recent shows:', error)
      return SAMPLE_SHOWS
    }
  }

  async getSongStats(): Promise<Song[]> {
    try {
      // Uncomment the following lines when you have a valid API key
      // const songsData = await this.fetchFromApi('songs')
      // const songs = await Promise.all(
      //   songsData.data.slice(0, 50).map(async (song: any) => {
      //     const songDetail = await this.fetchFromApi(`songdata/slug/${song.slug}`)
      //     return this.transformSong(songDetail.data[0])
      //   })
      // )
      // return songs
      
      // For now, return sample data
      return SAMPLE_SONGS
    } catch (error) {
      console.error('Error fetching song stats:', error)
      return SAMPLE_SONGS
    }
  }

  async getSummer2025Shows(): Promise<Show[]> {
    try {
      // Get shows from summer 2025 (adjust dates as needed)
      // const data = await this.fetchFromApi('shows/showdate/2025-07-01/2025-07-31')
      // return data.data.map(this.transformShow)
      
      return SAMPLE_SHOWS
    } catch (error) {
      console.error('Error fetching summer 2025 shows:', error)
      return SAMPLE_SHOWS
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
