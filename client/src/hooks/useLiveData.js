import { useState, useEffect, useRef } from 'react'
import useAppStore from '../store/appStore.js'
import logger from '../utils/logger.js'

const POLL_INTERVAL_MS = 60_000
const API_BASE = import.meta.env.VITE_API_BASE_URL

const useLiveData = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const setTrendData = useAppStore((s) => s.setTrendData)
  const setArcData = useAppStore((s) => s.setArcData)
  const setLastUpdated = useAppStore((s) => s.setLastUpdated)
  const trendData = useAppStore((s) => s.trendData)
  const lastUpdated = useAppStore((s) => s.lastUpdated)
  const intervalRef = useRef(null)

  const fetchTrends = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/trends`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      // Support both { data, lastUpdated } envelope and bare array
      const data = Array.isArray(json) ? json : json.data ?? []
      const ts = Array.isArray(json) ? new Date().toISOString() : (json.lastUpdated ?? new Date().toISOString())
      const arcs = Array.isArray(json) ? [] : (json.arcs ?? [])
      setTrendData(data)
      setArcData(arcs)
      setLastUpdated(ts)
      setError(null)
    } catch (err) {
      logger.error('useLiveData fetch failed:', err)
      // Keep stale data in the store — don't blank the map
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTrends()
    intervalRef.current = setInterval(fetchTrends, POLL_INTERVAL_MS)
    return () => clearInterval(intervalRef.current)
  }, [])

  return { data: trendData, isLoading, error, lastUpdated }
}

export default useLiveData
