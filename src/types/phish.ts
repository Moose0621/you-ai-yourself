export interface Song {
  name: string
  slug: string
  timesPlayed: number
  averageLength: number
  firstPlayed?: string | null
  lastPlayed?: string | null
  gap?: number
  tags: string[]
  longestJam?: JamPerformance
}

export interface JamPerformance {
  length: number // in minutes
  date: string
  venue: string
  city: string
  state?: string | null
  showid?: number
}

export interface Show {
  showid: number
  date: string
  venue: string
  city: string
  state: string | null
  country: string
  setlistnotes: string
  songs: string[] // Array of song names or empty
  // Tour information
  tourid?: number
  tour_name?: string
  // Legacy fields for backward compatibility
  showdate?: string
  location?: string
  setlistdata?: unknown
  tourName?: string
}

export interface FilterOptions {
  sortBy: 'timesPlayed' | 'averageLength' | 'name'
  sortOrder: 'asc' | 'desc'
  minLength: number
  maxLength: number
  searchTerm: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

export interface PhishNetApiResponse {
  error: boolean
  error_message: string
  total_entries?: number
  total_pages?: number
  page?: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]
}
