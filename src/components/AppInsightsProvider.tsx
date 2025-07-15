'use client'

import { useEffect } from 'react'
import { initializeAppInsights } from '@/lib/appInsights'

export function AppInsightsProvider() {
  useEffect(() => {
    initializeAppInsights()
  }, [])
  
  return null
}