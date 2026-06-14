import { useState } from 'react'
import DOMPurify from 'dompurify'
import useAppStore from '../store/appStore.js'
import logger from '../utils/logger.js'

const API_BASE = import.meta.env.VITE_API_BASE_URL
const MAX_QUERY_LENGTH = 500

const useAIQuery = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState(null)

  const setAiResponse          = useAppStore((s) => s.setAiResponse)
  const setIsAIPanelOpen       = useAppStore((s) => s.setIsAIPanelOpen)
  const setIsChatPanelOpen     = useAppStore((s) => s.setIsChatPanelOpen)
  const addMessageToActiveChat = useAppStore((s) => s.addMessageToActiveChat)

  const submit = async (rawQuery) => {
    const sanitized = DOMPurify.sanitize(rawQuery).slice(0, MAX_QUERY_LENGTH).trim()
    if (!sanitized) return

    // Read fresh store state at call time so callers that update Zustand immediately
    // before submit (e.g. onboarding) always have the correct context injected.
    const { activeRegion, timeRange, activeSources, activeTags } = useAppStore.getState()

    setIsLoading(true)
    setError(null)
    setIsAIPanelOpen(true)

    addMessageToActiveChat({
      role: 'user',
      content: sanitized,
      timestamp: new Date().toISOString(),
    })

    try {
      const res = await fetch(`${API_BASE}/api/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: sanitized,
          region: activeRegion || 'Global',
          timeRange,
          activeSources,
          activeTags: activeTags.filter((t) => t.active !== false).map((t) => t.label),
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      setAiResponse(data)
      setIsChatPanelOpen(true)

      addMessageToActiveChat({
        role: 'assistant',
        content: data.answer ?? '',
        confidence: data.confidence ?? 50,
        citations: data.citations ?? [],
        followUps: data.followUps ?? [],
        timestamp: new Date().toISOString(),
      })
    } catch (err) {
      logger.error('useAIQuery failed:', err)
      setError('Query failed — check your connection and try again.')
      addMessageToActiveChat({
        role: 'assistant',
        content: 'Unable to reach PULSE intelligence at this time. Please try again.',
        confidence: 0,
        citations: [],
        followUps: [],
        timestamp: new Date().toISOString(),
        isError: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return { submit, isLoading, error }
}

export default useAIQuery
