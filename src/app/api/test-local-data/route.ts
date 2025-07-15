import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get the origin from the request
    const origin = request.nextUrl.origin
    
    // Test if we can fetch the data from the public directory
    const response = await fetch(`${origin}/processed-data.json`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      message: 'Local data test successful',
      totalSongs: data.songs?.length || 0,
      totalShows: data.shows?.length || 0,
      firstFewSongs: data.songs?.slice(0, 3)?.map((s: { name: string; timesPlayed: number; averageLength: number }) => ({
        name: s.name,
        timesPlayed: s.timesPlayed,
        averageLength: s.averageLength
      })) || []
    })
  } catch (error) {
    console.error('Local data test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to load local data'
    }, { status: 500 })
  }
}
