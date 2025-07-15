export interface Song {
  name: string
  slug: string
  timesPlayed: number
  averageLength: number
  firstPlayed?: string
  lastPlayed?: string
  gaps?: number[]
  debuts?: string[]
  tags?: string[]
}

export interface Show {
  showdate: string
  venue: string
  location: string
  setlistdata?: any
  songs?: Song[]
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
  success: boolean
  total_entries?: number
  total_pages?: number
  page?: number
  data: any[]
}
