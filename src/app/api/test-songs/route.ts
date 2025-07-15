import { NextResponse } from 'next/server'
import { phishApi } from '@/lib/phishApi'

export async function GET() {
  try {
    console.log('🧪 Testing song stats API...')
    const songs = await phishApi.getSongStats()
    
    console.log(`✅ Retrieved ${songs.length} songs`)
    console.log('📊 Sample songs:', songs.slice(0, 3).map(s => ({
      name: s.name,
      timesPlayed: s.timesPlayed,
      averageLength: s.averageLength,
      tags: s.tags
    })))
    
    return NextResponse.json({
      success: true,
      count: songs.length,
      sampleSongs: songs.slice(0, 5)
    })
  } catch (error) {
    console.error('❌ Test API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
