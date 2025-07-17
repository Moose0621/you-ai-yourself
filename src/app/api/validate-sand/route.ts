import { NextResponse } from 'next/server'
import { phishApi } from '@/lib/simpleLocalPhishApi'

export async function GET() {
  try {
    console.log('🔍 Validating Sand data...')
    const songs = await phishApi.getSongStats()
    
    const sandSong = songs.find(song => song.name === 'Sand')
    
    if (!sandSong) {
      return NextResponse.json({
        success: false,
        error: 'Sand song not found in dataset'
      }, { status: 404 })
    }
    
    // Validation checks
    const validations = {
      hasCorrectName: sandSong.name === 'Sand',
      hasReasonableTimesPlayed: sandSong.timesPlayed >= 150 && sandSong.timesPlayed <= 200,
      hasCorrectAverageLength: sandSong.averageLength >= 20 && sandSong.averageLength <= 30,
      hasJamVehicleTag: sandSong.tags?.includes('Jam Vehicle'),
      hasCommonTag: sandSong.tags?.includes('Common'),
      hasLongestJam: sandSong.longestJam !== null && sandSong.longestJam !== undefined,
      longestJamReasonable: sandSong.longestJam?.length && sandSong.longestJam.length >= 15 && sandSong.longestJam.length <= 40,
      hasCorrectFirstPlayed: sandSong.firstPlayed === '1999-09-11'
    }
    
    const allValid = Object.values(validations).every(v => v === true)
    
    console.log('✅ Sand validation results:', validations)
    
    return NextResponse.json({
      success: true,
      valid: allValid,
      sandData: sandSong,
      validations,
      recommendations: allValid ? [] : [
        !validations.hasCorrectName && 'Name should be "Sand"',
        !validations.hasReasonableTimesPlayed && 'Times played should be between 150-200',
        !validations.hasCorrectAverageLength && 'Average length should be between 20-30 minutes',
        !validations.hasJamVehicleTag && 'Should have "Jam Vehicle" tag',
        !validations.hasCommonTag && 'Should have "Common" tag',
        !validations.hasLongestJam && 'Should have longest jam data',
        !validations.longestJamReasonable && 'Longest jam should be between 15-40 minutes',
        !validations.hasCorrectFirstPlayed && 'First played should be 1999-09-11'
      ].filter(Boolean)
    })
  } catch (error) {
    console.error('❌ Sand validation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
