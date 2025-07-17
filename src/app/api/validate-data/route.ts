import { NextResponse } from 'next/server'
import { phishApi } from '@/lib/simpleLocalPhishApi'

export async function GET() {
  try {
    console.log('🔍 Validating all song data...')
    const songs = await phishApi.getSongStats()
    
    const validationResults = {
      totalSongs: songs.length,
      validSongs: 0,
      invalidSongs: 0,
      issues: [] as Array<{
        songName: string,
        issues: string[]
      }>,
      summary: {
        songsWithTags: 0,
        songsWithJamVehicleTag: 0,
        songsWithLongestJam: 0,
        averageLength: 0,
        suspiciousLengths: [] as string[]
      }
    }
    
    // Key songs that should be jam vehicles
    const expectedJamVehicles = [
      'Sand', 'Tweezer', 'Ghost', 'Piper', 'Rock and Roll', 'Chalk Dust Torture',
      'Down with Disease', 'Crosseyed and Painless', 'Simple', 'Bathtub Gin',
      'Runaway Jim', 'Stash', 'David Bowie', 'Harry Hood', 'You Enjoy Myself',
      'Character Zero', 'Wolfman\'s Brother', 'Antelope', 'Mike\'s Song',
      'Weekapaug Groove', 'Also Sprach Zarathustra', 'Fluffhead', 'Slave to the Traffic Light'
    ]
    
    let totalLength = 0
    
    songs.forEach(song => {
      const songIssues: string[] = []
      
      // Basic validation
      if (!song.name || song.name.trim() === '') {
        songIssues.push('Missing or empty name')
      }
      
      if (!song.slug || song.slug.trim() === '') {
        songIssues.push('Missing or empty slug')
      }
      
      if (song.timesPlayed < 0) {
        songIssues.push('Negative times played')
      }
      
      if (song.averageLength < 0) {
        songIssues.push('Negative average length')
      }
      
      if (song.averageLength > 60) {
        songIssues.push('Suspiciously long average length (>60 minutes)')
        validationResults.summary.suspiciousLengths.push(`${song.name}: ${song.averageLength}m`)
      }
      
      // Check for expected jam vehicles
      if (expectedJamVehicles.includes(song.name)) {
        if (!song.tags?.includes('Jam Vehicle')) {
          songIssues.push('Expected to have "Jam Vehicle" tag')
        }
        if (song.averageLength < 8) {
          songIssues.push('Expected longer average length for jam vehicle')
        }
      }
      
      // Date validation
      if (song.firstPlayed && !Date.parse(song.firstPlayed)) {
        songIssues.push('Invalid first played date format')
      }
      
      if (song.lastPlayed && !Date.parse(song.lastPlayed)) {
        songIssues.push('Invalid last played date format')
      }
      
      // Longest jam validation
      if (song.longestJam) {
        if (song.longestJam.length < 0) {
          songIssues.push('Negative longest jam length')
        }
        if (song.longestJam.length > 60) {
          songIssues.push('Suspiciously long jam (>60 minutes)')
        }
        if (song.longestJam.length < song.averageLength) {
          songIssues.push('Longest jam shorter than average length')
        }
        if (!song.longestJam.date || !Date.parse(song.longestJam.date)) {
          songIssues.push('Invalid longest jam date')
        }
        validationResults.summary.songsWithLongestJam++
      }
      
      // Count statistics
      if (song.tags && song.tags.length > 0) {
        validationResults.summary.songsWithTags++
        if (song.tags.includes('Jam Vehicle')) {
          validationResults.summary.songsWithJamVehicleTag++
        }
      }
      
      totalLength += song.averageLength
      
      if (songIssues.length > 0) {
        validationResults.invalidSongs++
        validationResults.issues.push({
          songName: song.name,
          issues: songIssues
        })
      } else {
        validationResults.validSongs++
      }
    })
    
    validationResults.summary.averageLength = totalLength / songs.length
    
    // Check specific expected songs
    const sandSong = songs.find(s => s.name === 'Sand')
    const tweezerSong = songs.find(s => s.name === 'Tweezer')
    const ghostSong = songs.find(s => s.name === 'Ghost')
    
    const keyValidation = {
      sandValid: sandSong && sandSong.averageLength > 20 && sandSong.tags?.includes('Jam Vehicle'),
      tweezerValid: tweezerSong && tweezerSong.averageLength > 15 && tweezerSong.tags?.includes('Jam Vehicle'),
      ghostValid: ghostSong && ghostSong.averageLength > 10 && ghostSong.tags?.includes('Jam Vehicle')
    }
    
    console.log('✅ Data validation completed')
    console.log(`📊 ${validationResults.validSongs}/${validationResults.totalSongs} songs valid`)
    console.log(`🏷️  ${validationResults.summary.songsWithJamVehicleTag} jam vehicles found`)
    
    return NextResponse.json({
      success: true,
      ...validationResults,
      keyValidation,
      isHealthy: validationResults.invalidSongs < (validationResults.totalSongs * 0.1), // < 10% invalid
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Data validation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
